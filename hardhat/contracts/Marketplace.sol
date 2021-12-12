// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Marketplace is ERC1155Holder, ReentrancyGuard, Ownable {
	IERC20 public erc20Token;
	address public feeCollector;
	uint public feeAmount;

	// A list of all the whitelisted nftContracts
	address[] public nftContracts;
	// NFT address to bool to check if whitelisted
	mapping(address => bool) public isWhitelisted;

	// NFT Contract Address => Token ID => Token Sale Details
	mapping(address => mapping(uint => Token)) public tokensForSale;

	struct Token {
		address seller;
		uint price;
	}

	event Purchased(
		address nftContract,
		address seller,
		address buyer,
		uint tokenId,
		uint price
	);

	constructor(
		address _feeCollector,
		address _erc20Token,
		uint _feeAmount
	) {
		feeCollector = _feeCollector;
		erc20Token = IERC20(_erc20Token);
		feeAmount = _feeAmount;
	}

	modifier onlyNFT() {
		require(
			isWhitelisted[msg.sender],
			"NFT contract address is not whitelisted!"
		);
		_;
	}

	modifier onlyERC20() {
		require(
			msg.sender == address(erc20Token),
			"Only the ERC20 contract can call this function!"
		);
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
		delete isWhitelisted[_nftContract];
	}

	function sellNFT(
		address _seller,
		uint _id,
		uint _price
	) external onlyNFT {
		require(
			IERC1155(msg.sender).balanceOf(address(this), _id) == 1,
			"Token Transfer Failed"
		);
		tokensForSale[msg.sender][_id] = Token(_seller, _price);
	}

	function sellMultipleNFTs(
		address _seller,
		uint[] calldata _ids,
		uint[] calldata _prices
	) external onlyNFT {
		IERC1155 nftContract = IERC1155(msg.sender);
		for (uint i; i < _ids.length; i++) {
			uint id = _ids[i]; // gas saver
			// Checks to make sure this contract received the NFTs.
			require(
				nftContract.balanceOf(address(this), id) == 1,
				"Token Transfer Failed"
			);
			tokensForSale[msg.sender][id] = Token(_seller, _prices[i]);
		}
	}

	function cancelNFTSale(address _contract, uint _id) external {
		// Check that only the owner can unlist their own NFT
		require(
			msg.sender == tokensForSale[_contract][_id].seller,
			"You are not the NFT seller."
		);
		// Make sure the contract has the NFT still
		IERC1155(_contract).safeTransferFrom(address(this), msg.sender, _id, 1, "");
		delete tokensForSale[_contract][_id];
	}

	// Can only cancel multiple NFTs sold from 1 contract
	function cancelMultipleNFTSales(address _contract, uint[] calldata _ids)
		external
	{
		IERC1155 nftContract = IERC1155(_contract);

		for (uint i; i < _ids.length; i++) {
			uint id = _ids[i]; // gas saver
			require(
				msg.sender == tokensForSale[_contract][id].seller,
				"You are not the NFT seller."
			);

			// Make sure the contract has the NFT still
			nftContract.safeTransferFrom(address(this), msg.sender, id, 1, "");
			delete tokensForSale[_contract][id];
		}
	}

	function purchaseNFT(uint _id) external nonReentrant onlyERC20 {
		// 1. User will first have to approve their ERC20 tokens to this address.
		// If it's a custom ERC20, you can do the same method as the NFT contract where
		// the ERC20 contract calls this function and transfers the token directly to it all in 1 tx
	}
}
