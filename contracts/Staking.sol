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

		emit NFTStaked(from, tokenId, block.number);
	}

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
	}

	function unstakeNFT(uint tokenId) external {
		_onlyStaker(tokenId);
		_requireTimeElapsed(tokenId);
	}

	function unstakeMultipleNFTs(uint[] calldata tokenIds) external {
		for (uint256 i; i < tokenIds.length; i++) {
			uint id = tokenIds[i]; // gas saver
			_onlyStaker(id);
			_requireTimeElapsed(id);
		}
	}

	function _payoutStake(uint256 tokenId) internal {
		/* NOTE : Must be called from non-reentrant function to be safe!*/

		// double check that the receipt exists and we're not staking from block 0
		require(
			receipt[tokenId].stakedFromBlock > 0,
			"_payoutStake: Can not stake from block 0"
		);

		// earned amount is difference between the stake start block, current block multiplied by stake amount
		uint256 timeStaked = _getTimeStaked(tokenId) - 1; // don't pay for the tx block of withdrawl
		uint256 payout = timeStaked * tokensPerBlock;

		// If contract does not have enough tokens to pay out, return the NFT without payment
		// This prevent a NFT being locked in the contract when empty
		if (erc20Token.balanceOf(address(this)) < payout) {
			emit StakePayout(
				msg.sender,
				tokenId,
				0,
				receipt[tokenId].stakedFromBlock,
				block.number
			);
			return;
		}

		// payout stake
		erc20Token.transfer(receipt[tokenId].owner, payout);

		emit StakePayout(
			msg.sender,
			tokenId,
			payout,
			receipt[tokenId].stakedFromBlock,
			block.number
		);
	}

	function _getTimeStaked(uint256 tokenId) internal view returns (uint) {
		if (receipt[tokenId].stakedFromBlock == 0) {
			return 0;
		}

		return block.number - receipt[tokenId].stakedFromBlock;
	}

	function harvestRewards(uint tokenId) external {}
}
