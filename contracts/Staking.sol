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

	uint256 public tokensPerBlock = .02 ether;

	struct Stake {
		uint256 stakedFromBlock;
		address owner;
	}

	// TokenID => Stake
	mapping(uint256 => Stake) public receipt;

	event NftStaked(address indexed staker, uint256 tokenId, uint256 blockNumber);
	event NftUnStaked(
		address indexed staker,
		uint256 tokenId,
		uint256 blockNumber
	);
	event StakePayout(
		address indexed staker,
		uint256 tokenId,
		uint256 stakeAmount,
		uint256 fromBlock,
		uint256 toBlock
	);
	event StakeRewardUpdated(uint256 rewardPerBlock);

	constructor(
		IERC1155 _nftToken,
		IERC20 _erc20Token,
		uint256 _tokensPerBlock
	) {
		nftToken = _nftToken;
		erc20Token = _erc20Token;
		tokensPerBlock = _tokensPerBlock;

		emit StakeRewardUpdated(tokensPerBlock);
	}

	// modifier onlyStaker(uint256 tokenId) {
	// 	// require that this contract has the NFT
	// 	require(
	// 		nftToken.ownerOf(tokenId) == address(this),
	// 		"onlyStaker: Contract is not owner of this NFT"
	// 	);

	// 	// require that this token is staked
	// 	require(
	// 		receipt[tokenId].stakedFromBlock != 0,
	// 		"onlyStaker: Token is not staked"
	// 	);

	// 	// require that msg.sender is the owner of this nft
	// 	require(
	// 		receipt[tokenId].owner == msg.sender,
	// 		"onlyStaker: Caller is not NFT stake owner"
	// 	);

	// 	_;
	// }

	modifier requireTimeElapsed(uint256 tokenId) {
		// require that some time has elapsed (IE you can not stake and unstake in the same block)
		require(
			receipt[tokenId].stakedFromBlock < block.number,
			"requireTimeElapsed: Can not stake/unStake/harvest in same block"
		);
		_;
	}

	function stakeNFT() public {
		nftToken.safeTransferFrom(msg.sender, address(this), 0, 1, "");
	}

	function stakeMultipleNFTs() public {}
}
