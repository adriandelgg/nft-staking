// SPDX-License-Identifier: MIT
pragma solidity =0.8.10;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

contract Staking is ERC1155Holder, ReentrancyGuard, Ownable {
	IERC1155 public nftToken;
	IERC20 public erc20Token;

	uint public tokensPerBlock;
	uint public totalNFTsStaked;

	struct Stake {
		address owner;
		uint stakedFromBlock;
		uint amountPaid;
	}

	// TokenID => Stake
	mapping(uint => Stake) public receipt;
	// Staker (owner) => TokenIDs
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

	function totalNFTsUserStaked(address account) public view returns (uint) {
		return stakedNFTs[account].length;
	}

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

	function _requireTimeElapsed(uint tokenId) private view {
		// require that some time has elapsed (IE you can NOT stake and unstake in the same block)
		require(
			receipt[tokenId].stakedFromBlock < block.number,
			"requireTimeElapsed: Can not stake/unStake/harvest in same block"
		);
	}

	modifier onlyNFT() {
		require(
			msg.sender == address(nftToken),
			"Stake: Caller can only be the ERC1155 contract"
		);
		_;
	}

	function getStakeContractBalance() public view returns (uint) {
		return erc20Token.balanceOf(address(this));
	}

	function updateStakingReward(uint _tokensPerBlock) external onlyOwner {
		tokensPerBlock = _tokensPerBlock;
		emit StakeRewardUpdated(tokensPerBlock);
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
	function stakeMultipleNFTs(address from, uint[] calldata tokenIds)
		external
		onlyNFT
	{
		uint[] storage _stakedNFTs = stakedNFTs[from]; // gas saver
		for (uint i; i < tokenIds.length; i++) {
			uint tokenId = tokenIds[i]; // gas saver
			// Checks to make sure this contract received the NFT.
			require(
				nftToken.balanceOf(address(this), tokenId) == 1,
				"Stake: Token Transfer Failed"
			);

			receipt[tokenId].owner = from;
			receipt[tokenId].stakedFromBlock = block.number;
			_stakedNFTs.push(tokenId);

			emit NFTStaked(from, tokenId, block.number);
		}
		totalNFTsStaked += tokenIds.length;
	}

	function unstakeNFT(uint tokenId) external nonReentrant {
		_onlyStaker(tokenId);
		_requireTimeElapsed(tokenId);
		_payoutStake(tokenId);
		nftToken.safeTransferFrom(address(this), msg.sender, tokenId, 1, "");
		totalNFTsStaked--;
	}

	function unstakeMultipleNFTs(uint[] calldata tokenIds) external nonReentrant {
		// Array needed to pay out the NFTs
		uint[] memory amounts = new uint[](tokenIds.length);
		uint[] memory nfts = stakedNFTs[msg.sender];

		for (uint i; i < tokenIds.length; i++) {
			uint id = tokenIds[i]; // gas save

			_onlyStaker(id);
			_requireTimeElapsed(id);
			_payoutStake(id);
			amounts[i] = 1;

			// Could possibly create a new event called NFTsUnstaked but would lead to some inconsitencies
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

	// 2 scenarios:
	//1. Create array and keep track of NFTs that have been staked (very costly)
	function withdrawRewardsArray() external {}

	//2. Pass in array of NFTs staked (you must remember the NFTs you staked),
	// then function will check to make sure you are the correct person that staked.
	// After, the function will calculate the amount to pay.
	// It must also keep track of the amount that has already been paid.

	// Function to withdraw rewards without global array
	function withdrawRewards(uint[] calldata tokenIds) external {
		for (uint i; i < tokenIds.length; i++) {
			uint tokenId = tokenIds[i]; // gas saver
			_onlyStaker(tokenId);
			_requireTimeElapsed(tokenId);
			_payoutStake(tokenId);

			// update receipt with a new block number
			receipt[tokenId].stakedFromBlock = block.number;
		}
	}
}
