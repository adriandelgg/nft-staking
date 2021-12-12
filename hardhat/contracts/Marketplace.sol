// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Marketplace is Ownable {
	IERC20 public erc20Token;
	address public feeCollector;
	uint public feeAmount;

	// A list of all the whitelisted nftContracts
	address[] public nftContracts;
	// NFT address to bool to check if whitelisted
	mapping(address => bool) public isWhitelisted;

	constructor(
		address _feeCollector,
		address _erc20Token,
		uint _feeAmount
	) {
		feeCollector = _feeCollector;
		erc20Token = IERC20(_erc20Token);
		feeAmount = _feeAmount;
	}

	modifier onlyWhitelisted(address _nft) {
		require(isWhitelisted[_nft], "NFT contract address is not whitelisted!");
		_;
	}

	function setFeeCollector(address _collector) external onlyOwner {
		feeCollector = _collector;
	}

	function setFeeAmount(uint _amount) external onlyOwner {
		feeAmount = _amount;
	}

	function setERC20Token(address _token) external onlyOwner {
		erc20Token = IERC20(_token);
	}

	function whitelistNFT(address _nftContract) external onlyOwner {
		nftContracts.push(_nftContract);
		isWhitelisted[_nftContract] = true;
	}

	function unwhitelistNFT(address _nftContract) external onlyOwner {
		address[] memory _nftContracts = nftContracts; // gas saver
		for (uint i; i < _nftContracts.length; i++) {
			if (_nftContracts[i] == _nftContract) {
				nftContracts[i] = _nftContracts[_nftContracts.length - 1];
				nftContracts.pop();
				break;
			}
		}
		isWhitelisted[_nftContract] = false;
	}
}
