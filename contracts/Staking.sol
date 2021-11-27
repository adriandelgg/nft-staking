// SPDX-License-Identifier: MIT
pragma solidity =0.8.10;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Staking is ERC1155Holder, ReentrancyGuard, Ownable {
	IERC1155 public nftToken;
	IERC20 public erc20Token;

	uint public tokensPerBlock; // the amount of tokens rewarded per block staked
	uint public totalNFTsStaked; // the total amount of NFTs that have been staked to the contract

	struct Stake {
		address owner;
		uint stakedFromBlock;
	}

	// TokenID => Stake
	mapping(uint => Stake) public receipt;
	// Mapping from the owner (Staker) to an array of all the token IDs they've staked
	mapping(address => uint[]) public stakedNFTs;

	event NFTStaked(address indexed staker, uint tokenId, uint blockNumber);
	event NFTUnStaked(address indexed staker, uint tokenId, uint blockNumber);
	event StakePayout(
		address indexed staker,
		uint tokenId,
		uint stakeAmount,
		uint fromBlock,
		uint toBlock
	);
	event StakeRewardUpdated(uint rewardPerBlock);

	// Sets the smart contract addresses for the NFT & ERC20 contract, as well as the amount
	// of rewards per block will be given to users that stake their NFTs
	constructor(
		IERC1155 _nftToken,
		IERC20 _erc20Token,
		uint _tokensPerBlock
	) {
		nftToken = _nftToken;
		erc20Token = _erc20Token;
		tokensPerBlock = _tokensPerBlock;

		emit StakeRewardUpdated(tokensPerBlock);
	}

	// Requires that only the NFT smart contract can call certain functions
	modifier onlyNFT() {
		require(
			msg.sender == address(nftToken),
			"Stake: Caller can only be the ERC1155 contract"
		);
		_;
	}

	// Returns the total amount of ERC20 tokens that this contract owns
	function getStakeContractBalance() public view returns (uint) {
		return erc20Token.balanceOf(address(this));
	}

	// Allows you to update the rewards per block amount
	function updateStakingReward(uint _tokensPerBlock) external onlyOwner {
		tokensPerBlock = _tokensPerBlock;
		emit StakeRewardUpdated(tokensPerBlock);
	}

	// Returns the length of the total amount an account has staked to this smart contract
	function totalNFTsUserStaked(address account) public view returns (uint) {
		return stakedNFTs[account].length;
	}

	// This contract gets called by the NFT contract when a user transfers its
	// NFT to it. It will only allow the NFT contract to call it and will log their
	// address and info to properly pay them out.
	// Whenever they want to unstake they call this contract directly which
	// will then transfer the funds and NFTs to them
	function stakeNFT(address from, uint tokenId) external onlyNFT {
		// Checks to make sure this contract received the NFT.
		require(
			nftToken.balanceOf(address(this), tokenId) == 1,
			"Stake: Token Transfer Failed"
		);

		receipt[tokenId].owner = from;
		receipt[tokenId].stakedFromBlock = block.number;
		stakedNFTs[from].push(tokenId);
		totalNFTsStaked++;

		emit NFTStaked(from, tokenId, block.number);
	}

	// NOTE: Due to the unavoidable gas limit of the Ethereum network,
	// a large amount of NFTs transfered could result to a failed transaction.
	// @dev This function NEEDS to be called from the NFT smart contract. Can't
	// be called directly or else it will fail. Allows a user to stake multiple
	// NFTs. The Parameters are fed by the NFT contract
	function stakeMultipleNFTs(address from, uint[] calldata tokenIds)
		external
		onlyNFT
	{
		for (uint i; i < tokenIds.length; i++) {
			uint tokenId = tokenIds[i]; // gas saver
			// Checks to make sure this contract received the NFT.
			require(
				nftToken.balanceOf(address(this), tokenId) == 1,
				"Stake: Token Transfer Failed"
			);

			receipt[tokenId].owner = from;
			receipt[tokenId].stakedFromBlock = block.number;
			stakedNFTs[from].push(tokenId);

			emit NFTStaked(from, tokenId, block.number);
		}
		totalNFTsStaked += tokenIds.length;
	}

	// This is the function a user calls when they want to unstake a single NFT.
	// Can be called directly, does not have to be called from the NFT contract.
	function unstakeNFT(uint tokenId) external nonReentrant {
		_onlyStaker(tokenId);
		_requireTimeElapsed(tokenId);
		_payoutStake(tokenId);

		uint[] memory _stakedNFTs = stakedNFTs[msg.sender]; // gas saver
		for (uint i; i < _stakedNFTs.length; i++) {
			if (_stakedNFTs[i] == tokenId) {
				stakedNFTs[msg.sender][i] = _stakedNFTs[_stakedNFTs.length - 1];
				stakedNFTs[msg.sender].pop();
			}
		}
		nftToken.safeTransferFrom(address(this), msg.sender, tokenId, 1, "");
		totalNFTsStaked--;
	}

	// This is the function to call when a user wants to unstake multiple NFTs.
	// Can be called directly. The user has to pass in an array of all the NFTs
	// they would like to unstake.
	function unstakeMultipleNFTs(uint[] calldata tokenIds) external nonReentrant {
		// Array needed to pay out the NFTs
		uint[] memory amounts = new uint[](tokenIds.length);
		uint[] storage _stakedNFTs = stakedNFTs[msg.sender]; // gas saver

		for (uint i; i < tokenIds.length; i++) {
			uint id = tokenIds[i]; // gas saver

			_onlyStaker(id);
			_requireTimeElapsed(id);
			_payoutStake(id);
			amounts[i] = 1;

			// Finds the ID in the array and removes it.
			for (uint x; x < _stakedNFTs.length; x++) {
				if (id == _stakedNFTs[x]) {
					_stakedNFTs[x] = _stakedNFTs[_stakedNFTs.length - 1];
					_stakedNFTs.pop();
					break;
				}
			}

			emit NFTUnStaked(msg.sender, id, receipt[id].stakedFromBlock);
		}

		nftToken.safeBatchTransferFrom(
			address(this),
			msg.sender,
			tokenIds,
			amounts,
			""
		);
		totalNFTsStaked -= tokenIds.length;
	}

	// NOTE: To only be called by a nonReentrant function.
	// This function is meant to be called by other functions within the smart contract.
	// Never called externally by the client.
	function _payoutStake(uint tokenId) private {
		Stake memory _tokenId = receipt[tokenId]; // gas saver

		// earned amount is difference between the stake start block, current block multiplied by stake amount
		uint timeStaked = (block.number - _tokenId.stakedFromBlock) - 1; // don't pay for the tx block of withdrawl
		uint payout = timeStaked * tokensPerBlock;

		// If contract does not have enough tokens to pay out, return the NFT without payment
		// This prevent a NFT being locked in the contract when empty
		if (erc20Token.balanceOf(address(this)) < payout) {
			emit StakePayout(
				msg.sender,
				tokenId,
				0,
				_tokenId.stakedFromBlock,
				block.number
			);
		} else {
			// payout stake
			erc20Token.transfer(_tokenId.owner, payout);

			emit StakePayout(
				msg.sender,
				tokenId,
				payout,
				_tokenId.stakedFromBlock,
				block.number
			);
		}
	}

	// This function is called when a user wants to withdraw their funds without
	// unstaking their NFT
	function withdrawRewards(uint[] calldata tokenIds) external nonReentrant {
		for (uint i; i < tokenIds.length; i++) {
			uint tokenId = tokenIds[i]; // gas saver
			_onlyStaker(tokenId);
			_requireTimeElapsed(tokenId);
			_payoutStake(tokenId);

			// update receipt with a new block number
			receipt[tokenId].stakedFromBlock = block.number;
		}
	}

	// Checks that only the person that staked the NFT can call a certain function
	function _onlyStaker(uint tokenId) private view {
		// require that this contract has the NFT
		require(
			nftToken.balanceOf(address(this), tokenId) == 1,
			"onlyStaker: Contract is not owner of this NFT"
		);

		// require that this token is staked
		require(
			receipt[tokenId].stakedFromBlock != 0,
			"onlyStaker: Token is not staked"
		);

		// require that msg.sender is the owner of this nft
		require(
			receipt[tokenId].owner == msg.sender,
			"onlyStaker: Caller is not NFT stake owner"
		);
	}

	// Requires that some time has elapsed (IE you can NOT stake and unstake in the same block)
	function _requireTimeElapsed(uint tokenId) private view {
		require(
			receipt[tokenId].stakedFromBlock < block.number,
			"requireTimeElapsed: Can not stake/unStake/harvest in same block"
		);
	}
}
