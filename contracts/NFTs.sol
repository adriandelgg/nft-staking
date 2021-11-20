// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

interface IStaking {
	function stakeNFT(address from, uint id) external;
}

contract NFTs is ERC1155Supply, Ownable {
	// Here you would define your game items, like the  accessories, treats, etc.

	IStaking public stakingContract;

	constructor() ERC1155("https://ipfs.io/") {}

	function setURI(string memory newuri) public onlyOwner {
		_setURI(newuri);
	}

	function setStakingContract(address _contract) public onlyOwner {
		stakingContract = IStaking(_contract);
	}

	function stakeNFT(uint id) public {
		// Check to make sure it's actually an NFT
		require(totalSupply(id) == 1, "Token ID is not an NFT");
		safeTransferFrom(msg.sender, address(stakingContract), id, 1, "");
		stakingContract.stakeNFT(msg.sender, id);
	}

	function mint(
		address account,
		uint256 id,
		uint256 amount,
		bytes memory data
	) public onlyOwner {
		_mint(account, id, amount, data);
	}

	function mintBatch(
		address to,
		uint256[] memory ids,
		uint256[] memory amounts,
		bytes memory data
	) public onlyOwner {
		_mintBatch(to, ids, amounts, data);
	}
}
