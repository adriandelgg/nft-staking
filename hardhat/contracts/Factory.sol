// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Staking.sol";
import "./NFTs.sol";

contract Factory is Ownable {
	event NewNFTContract(address contractAddress);
	event NewStakingContract(address contractAddress);

	function createNFTContract(address _marketplaceContract) public onlyOwner {
		emit NewNFTContract(address(new NFTs(msg.sender, _marketplaceContract)));
	}

	function createStakingContract(
		address _nftContract,
		address _erc20Contract,
		uint _tokenPerBlock
	) public onlyOwner {
		emit NewStakingContract(
			address(new Staking(_nftContract, _erc20Contract, _tokenPerBlock))
		);
	}
}
