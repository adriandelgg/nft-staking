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

	// When setting the fee amount, you must make the percentage as a whole number.
	// E.G: 5% = 5, 10% = 10, 50% = 50, etc.
	uint public feeAmount;

	// A list of all the whitelisted nftContracts
	// ! Not necessarily needed & mapping would work just fine!
	address[] public nftContracts;

	// NFT address to bool to check if whitelisted
	mapping(address => bool) public isWhitelisted;

	// NFT Contract Address => Token ID => Token Sale Details
	// To use it, you give it an NFT contract address, then the Token ID,
	// and this will give you the seller & price.
	mapping(address => mapping(uint => Token)) public tokensForSale;

	struct Token {
		address seller;
		uint price;
	}

	event ListedForSale(
		address indexed nftContract,
		address indexed seller,
		uint tokenId,
		uint price
	);

	event CancelledSale(
		address indexed nftContract,
		address indexed seller,
		uint tokenId
	);

	event Purchased(
		address indexed nftContract,
		address indexed seller,
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

	// Checks that only whitelisted NFT contracts can call a function.
	modifier onlyNFT() {
		require(
			isWhitelisted[msg.sender],
			"NFT contract address is not whitelisted!"
		);
		_;
	}

	// This returns the length amount of NFT contracts in the array.
	function totalNFTContracts() public view returns (uint) {
		return nftContracts.length;
	}

	// Returns an array of all the whitelisted NFT contracts.
	function getNFTContracts() public view returns (address[] memory) {
		return nftContracts;
	}

	// Sets who the fees go to.
	function setFeeCollector(address _collector) external onlyOwner {
		feeCollector = _collector;
	}

	// Sets the fee % amount that goes to the fee collector.
	// NOTE: Must be added as a whole number.
	// Ex: 5 = 5%, 50 = 50%, 10 = 10%
	function setFeeAmount(uint _amount) external onlyOwner {
		feeAmount = _amount;
	}

	// If you change the ERC20 token, you can use this function to set the new token address.
	function setERC20Token(address _token) external onlyOwner {
		erc20Token = IERC20(_token);
	}

	// Whitelists an NFT address so that it can be used with this marketplace
	function whitelistNFTContract(address _nftContract) external onlyOwner {
		require(
			!isWhitelisted[_nftContract],
			"NFT contract is already whitelisted"
		);
		nftContracts.push(_nftContract);
		isWhitelisted[_nftContract] = true;
	}

	// Calculates the fee that goes to the collector, and the amount a seller earns.
	function calculateFee(uint _price)
		public
		view
		returns (uint fee, uint toSeller)
	{
		fee = (_price * feeAmount) / 100;
		toSeller = _price - fee;
	}

	// Removes a whitelisted NFT contract
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

	// Can only be called by the whitelisted NFT contract
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

	// Can only be called by the whitelisted NFT contract
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

	// Must pass in the contract's address to differentiant between other token IDs
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
		require(token.seller != address(0), "NFT is not for sale");

		// Calculates the fee to pay to feeCollector & seller
		(uint fee, uint toSeller) = calculateFee(token.price);

		// Transfers ERC20 & NFT
		IERC1155(_contract).safeTransferFrom(address(this), msg.sender, _id, 1, "");
		erc20Token.transferFrom(msg.sender, feeCollector, fee);
		erc20Token.transferFrom(msg.sender, token.seller, toSeller);

		delete tokensForSale[_contract][_id];

		emit Purchased(_contract, token.seller, msg.sender, _id, token.price);
	}
}
