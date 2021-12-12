// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IStaking {
	function stakeNFT(address from, uint id) external;

	function stakeMultipleNFTs(address from, uint[] calldata tokenIds) external;
}

interface IMarketplace {
	function sellNFT(
		address _seller,
		uint _id,
		uint _price
	) external;

	function sellMultipleNFTs(
		address _seller,
		uint[] calldata _ids,
		uint[] calldata _prices
	) external;
}

contract NFTs is ERC1155Supply, Ownable {
	// Here you would define your game items, like the  accessories, treats, etc.

	IStaking public stakingContract;
	IMarketplace public marketplaceContract;

	constructor() ERC1155("https://ipfs.io/") {}

	function setURI(string memory newuri) public onlyOwner {
		_setURI(newuri);
	}

	// @note Staking contract must be set after deployment since staking
	// contract needs the address of this contract on its deployement.
	function setStakingContract(address _contract) public onlyOwner {
		stakingContract = IStaking(_contract);
	}

	function setMarketplaceContract(address _contract) public onlyOwner {
		marketplaceContract = IMarketplace(_contract);
	}

	function mint(
		address account,
		uint id,
		uint amount,
		bytes memory data
	) public onlyOwner {
		_mint(account, id, amount, data);
	}

	function mintBatch(
		address to,
		uint[] memory ids,
		uint[] memory amounts,
		bytes memory data
	) public onlyOwner {
		_mintBatch(to, ids, amounts, data);
	}

	function isNFT(uint id) public view returns (bool) {
		return totalSupply(id) == 1;
	}

	// Transfers NFT from caller to the staking contract.
	function stakeNFT(uint id) external {
		// Check to make sure it's actually an NFT
		require(isNFT(id), "Token ID is not an NFT");
		safeTransferFrom(msg.sender, address(stakingContract), id, 1, "");
		stakingContract.stakeNFT(msg.sender, id);
	}

	// NOTE: Due to the unavoidable gas limit of the Ethereum network,
	// a large amount of NFTs transfered could result to a failed transaction.
	// *An alt scenerio would be to approve all NFTs to the staking contract,
	// then call a function in the stake contract to batch transfer them all to itself.
	function stakeMultipleNFTs(uint[] calldata ids) external {
		// Array needed to pay out the NFTs
		uint[] memory amounts = new uint[](ids.length);
		for (uint i; i < ids.length; i++) {
			require(isNFT(ids[i]), "Token ID is not an NFT");
			amounts[i] = 1;
		}

		safeBatchTransferFrom(
			msg.sender,
			address(stakingContract),
			ids,
			amounts,
			""
		);
		stakingContract.stakeMultipleNFTs(msg.sender, ids);
	}

	function sellNFT(uint id, uint price) external {
		require(price >= 1e5, "Minimum amount must be greater than 1e5");
		require(isNFT(id), "Token ID is not an NFT");
		safeTransferFrom(msg.sender, address(marketplaceContract), id, 1, "");
		marketplaceContract.sellNFT(msg.sender, id, price);
	}

	function sellMultipleNFTs(uint[] calldata ids, uint[] calldata prices)
		external
	{
		uint[] memory amounts = new uint[](ids.length);
		for (uint i; i < ids.length; i++) {
			require(prices[i] >= 1e5, "Minimum amount must be greater than 1e5");
			require(isNFT(ids[i]), "Token ID is not an NFT");
			amounts[i] = 1;
		}

		safeBatchTransferFrom(
			msg.sender,
			address(marketplaceContract),
			ids,
			amounts,
			""
		);
		marketplaceContract.sellMultipleNFTs(msg.sender, ids, prices);
	}
}
