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
	// ! Not necessarily needed & mapping would work just fine!
	address[] public nftContracts;

	// NFT address to bool to check if whitelisted
	mapping(address => bool) public isWhitelisted;

	// NFT Contract Address => Token ID => Token Sale Details
	mapping(address => mapping(uint => Token)) public tokensForSale;

	struct Token {
		address seller;
		uint price;
	}

	event ListedForSale(
		address nftContract,
		address seller,
		uint tokenId,
		uint price
	);

	event CancelledSale(address nftContract, address seller, uint tokenId);

	event Purchased(
		address nftContract,
		address seller,
		address buyer,
		uint tokenId,
		uint price
	);

	constructor(
		address _erc20Token,
		address _feeCollector,
		uint _feeAmount
	) {
		erc20Token = IERC20(_erc20Token);
		feeCollector = _feeCollector;
		feeAmount = _feeAmount;
	}

	modifier onlyNFT() {
		require(
			isWhitelisted[msg.sender],
			"NFT contract address is not whitelisted!"
		);
		_;
	}

	function totalNFTContracts() public view returns (uint) {
		return nftContracts.length;
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

	function whitelistNFTContract(address _nftContract) external onlyOwner {
		nftContracts.push(_nftContract);
		isWhitelisted[_nftContract] = true;
	}

	function calculateFee(uint _price)
		public
		view
		returns (uint fee, uint toSeller)
	{
		fee = (_price * feeAmount) / 100;
		toSeller = _price - fee;
	}

	function unwhitelistNFTContract(address _nftContract) external onlyOwner {
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
		emit ListedForSale(msg.sender, _seller, _id, _price);
	}

	function sellMultipleNFTs(
		address _seller,
		uint[] calldata _ids,
		uint[] calldata _prices
	) external onlyNFT {
		IERC1155 nftContract = IERC1155(msg.sender);

		for (uint i; i < _ids.length; i++) {
			uint id = _ids[i]; // gas saver
			uint price = _prices[i]; // gas saver

			// Checks to make sure this contract received the NFTs.
			require(
				nftContract.balanceOf(address(this), id) == 1,
				"Token Transfer Failed"
			);

			tokensForSale[msg.sender][id] = Token(_seller, price);

			emit ListedForSale(msg.sender, _seller, id, price);
		}
	}

	function cancelNFTSale(address _contract, uint _id) external nonReentrant {
		// Check that only the owner can unlist their own NFT
		require(
			msg.sender == tokensForSale[_contract][_id].seller,
			"You are not the NFT seller."
		);

		// Transfer fails if contract doesn't have the NFT
		IERC1155(_contract).safeTransferFrom(address(this), msg.sender, _id, 1, "");
		delete tokensForSale[_contract][_id];

		emit CancelledSale(_contract, msg.sender, _id);
	}

	// Can only cancel multiple NFTs sold from 1 contract
	function cancelMultipleNFTSales(address _contract, uint[] calldata _ids)
		external
		nonReentrant
	{
		IERC1155 nftContract = IERC1155(_contract);

		for (uint i; i < _ids.length; i++) {
			uint id = _ids[i]; // gas saver
			require(
				msg.sender == tokensForSale[_contract][id].seller,
				"You are not the NFT seller."
			);

			// Transfer fails if contract doesn't have the NFT
			nftContract.safeTransferFrom(address(this), msg.sender, id, 1, "");
			delete tokensForSale[_contract][id];

			emit CancelledSale(_contract, msg.sender, id);
		}
	}

	///@notice User will first have to approve their ERC20 tokens to this address.
	function purchaseNFT(address _contract, uint _id) external nonReentrant {
		Token memory token = tokensForSale[_contract][_id]; // gas saver
		require(token.seller != msg.sender, "You can NOT buy your own NFT");

		// Calculates the fee to pay to feeCollector & seller
		(uint fee, uint toSeller) = calculateFee(token.price);

		// Transfers ERC20 & NFT
		erc20Token.transferFrom(msg.sender, feeCollector, fee);
		erc20Token.transferFrom(msg.sender, token.seller, toSeller);
		IERC1155(_contract).safeTransferFrom(address(this), msg.sender, _id, 1, "");

		delete tokensForSale[_contract][_id];

		emit Purchased(_contract, token.seller, msg.sender, _id, token.price);
	}
}
