// SPDX-License-Identifier: MIT
pragma solidity >=0.8.10;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

<<<<<<< HEAD:contracts/Staking.sol
contract Staking is ERC1155Holder, ReentrancyGuard, Ownable {
=======
contract StakingNoArray is ERC1155Holder, ReentrancyGuard, Ownable {
>>>>>>> nft-staked-array:hardhat/contracts/StakingNoArray.sol
	IERC1155 public nftToken;
	IERC20 public erc20Token;

	uint public tokensPerBlock;
	uint public totalNFTsStaked;

	struct Stake {
		address owner;
		uint stakedFromBlock;
	}

	// TokenID => Stake
	mapping(uint => Stake) public receipt;

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

	// Only the NFT contract can call certain functions
	modifier onlyNFT() {
		require(
			msg.sender == address(nftToken),
			"Stake: Caller can only be the ERC1155 contract"
		);
		_;
	}

	// Returns the total ERC20 token balance of this contract
	function getStakeContractBalance() public view returns (uint) {
		return erc20Token.balanceOf(address(this));
	}

	// Updates the reward amount per blocks
	function updateStakingReward(uint _tokensPerBlock) external onlyOwner {
		tokensPerBlock = _tokensPerBlock;
		emit StakeRewardUpdated(tokensPerBlock);
	}

	// Allows a user to stake a single NFT & logs their info to properly pay the out
	// and perform important security checks.
	function stakeNFT(address from, uint tokenId) external onlyNFT {
		// Checks to make sure this contract received the NFT.
		require(
			nftToken.balanceOf(address(this), tokenId) == 1,
			"Stake: Token Transfer Failed"
		);

		receipt[tokenId].owner = from;
		receipt[tokenId].stakedFromBlock = block.number;
		totalNFTsStaked++;

		emit NFTStaked(from, tokenId, block.number);
	}

	// NOTE: Due to the unavoidable gas limit of the Ethereum network,
	// a large amount of NFTs transfered could result to a failed transaction.
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

			emit NFTStaked(from, tokenId, block.number);
		}
		totalNFTsStaked += tokenIds.length;
	}

	// Allows the user to unstake 1 NFT & pays them. If they withdraw in the same exact
	// block, they will only withdraw and not receive any rewards.
	function unstakeNFT(uint tokenId) external nonReentrant {
		_onlyStaker(tokenId);
		_requireTimeElapsed(tokenId);
		_payoutStake(tokenId);
		nftToken.safeTransferFrom(address(this), msg.sender, tokenId, 1, "");
		totalNFTsStaked--;
	}

	// Allows users to unstake multiple NFTs in a single transaction.
	// Will not reward anything if unstaked within the same block the NFT was given.
	function unstakeMultipleNFTs(uint[] calldata tokenIds) external nonReentrant {
		// Array needed to pay out the NFTs
		uint[] memory amounts = new uint[](tokenIds.length);

		for (uint i; i < tokenIds.length; i++) {
			uint id = tokenIds[i]; // gas saver

			_onlyStaker(id);
			_requireTimeElapsed(id);
			_payoutStake(id);
			amounts[i] = 1;

			emit NFTUnStaked(msg.sender, id, receipt[id].stakedFromBlock);
		}

		// Transfers NFTs after rewards have been properly paid out
		nftToken.safeBatchTransferFrom(
			address(this),
			msg.sender,
			tokenIds,
			amounts,
			""
		);
		totalNFTsStaked -= tokenIds.length;
	}

	// Allows the user to withdraw their rewards without unstaking their NFT
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

	// Function to calculate the payout amount for a staked NFT
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

	// Used to make sure that only the person that staked the NFT is allowed
	// to withdraw or interact with the function.
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
