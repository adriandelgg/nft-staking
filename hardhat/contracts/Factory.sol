// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./NFTs.sol";

contract Factory is Ownable {
	event NewNFTContract(address contractAddress);

	function createNFTContract(address _marketplaceContract) public onlyOwner {
		emit NewNFTContract(address(new NFTs(msg.sender, _marketplaceContract)));
	}
}
