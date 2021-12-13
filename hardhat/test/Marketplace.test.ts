import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { parseEther } from "ethers/lib/utils";
import {
	Marketplace__factory,
	Marketplace,
	NFTs__factory,
	NFTs,
	ERC20Token__factory,
	ERC20Token
} from "../typechain-types/index";

describe("Marketplace", function () {
	const oneEther = parseEther("1");
	const tokenIds = [0, 1, 2, 3, 4];
	const amounts = [1, 1, 1, 1, 1];
	const prices = [1e5, 2e5, 3e5, 4e5, 5e5];
	let owner: SignerWithAddress,
		bob: SignerWithAddress,
		chad: SignerWithAddress,
		market: Marketplace,
		market2: Marketplace,
		nft: NFTs,
		nft2: NFTs,
		token: ERC20Token,
		token2: ERC20Token;

	beforeEach(async function () {
		[owner, bob, chad] = await ethers.getSigners();
		const NFTFactory = new NFTs__factory(owner);
		nft = await NFTFactory.deploy();
		nft2 = nft.connect(bob);

		await nft.mintBatch(owner.address, tokenIds, amounts, []);
		for (let i = 0; i < 5; i++) {
			expect(await nft.balanceOf(owner.address, i)).to.equal(1);
		}

		const ERC20Factory = new ERC20Token__factory(owner);
		token = await ERC20Factory.deploy("Testing", "TEST");
		token2 = token.connect(bob);

		const MarketFactory = new Marketplace__factory(owner);
		market = await MarketFactory.deploy(token.address, chad.address, 5);
		market2 = market.connect(bob);

		await nft.setMarketplaceContract(market.address);
		expect(await nft.marketplaceContract()).to.equal(market.address);
	});

	xit("should setFeeCollector", async () => {
		expect(await market.feeCollector()).to.equal(chad.address);

		console.log(
			"Gas cost: " +
				(await market.estimateGas.setFeeCollector(owner.address)).toString()
		);
		await market.setFeeCollector(owner.address);

		expect(await market.feeCollector()).to.equal(owner.address);
	});

	xit("should setERC20Token", async () => {
		expect(await market.erc20Token()).to.equal(token.address);

		console.log(
			"Gas cost: " +
				(await market.estimateGas.setERC20Token(owner.address)).toString()
		);
		await market.setERC20Token(owner.address);

		expect(await market.erc20Token()).to.equal(owner.address);
	});

	xit("should setFeeAmount", async () => {
		expect(await market.feeAmount()).to.equal(5);

		console.log(
			"Gas cost: " + (await market.estimateGas.setFeeAmount(10)).toString()
		);
		await market.setFeeAmount(10);

		expect(await market.feeAmount()).to.equal(10);
	});

	xit("should whitelistNFT", async () => {
		expect(await market.totalNFTContracts()).to.equal(0);
		expect(await market.isWhitelisted(nft.address)).to.equal(false);

		console.log(
			"Gas cost: " +
				(await market.estimateGas.whitelistNFTContract(nft.address)).toString()
		);
		await market.whitelistNFTContract(nft.address);

		expect(await market.totalNFTContracts()).to.equal(1);
		expect(await market.isWhitelisted(nft.address)).to.equal(true);
	});

	xit("should unwhitelistNFT", async () => {
		expect(await market.totalNFTContracts()).to.equal(0);
		expect(await market.isWhitelisted(nft.address)).to.equal(false);

		await market.whitelistNFTContract(nft.address);

		expect(await market.totalNFTContracts()).to.equal(1);
		expect(await market.isWhitelisted(nft.address)).to.equal(true);

		console.log(
			"Gas cost: " +
				(
					await market.estimateGas.unwhitelistNFTContract(nft.address)
				).toString()
		);
		await market.unwhitelistNFTContract(nft.address);

		expect(await market.totalNFTContracts()).to.equal(0);
		expect(await market.isWhitelisted(nft.address)).to.equal(false);
	});

	xit("should list NFT for sale", async () => {
		expect(await market.isWhitelisted(nft.address)).to.equal(false);

		await expect(nft.sellNFT(0, 1e5)).to.be.revertedWith(
			"NFT contract address is not whitelisted!"
		);
		console.log(
			"Gas cost: " +
				(await market.estimateGas.whitelistNFTContract(nft.address)).toString()
		);
		await market.whitelistNFTContract(nft.address);

		console.log(
			"Gas cost: " + (await nft.estimateGas.sellNFT(0, 1e5)).toString()
		);
		await nft.sellNFT(0, 1e5);

		const { seller, price } = await market.tokensForSale(nft.address, 0);

		expect(seller).to.equal(owner.address);
		expect(price).to.equal(1e5);
	});

	it("should sellMultipleNFTs", async () => {
		await market.whitelistNFTContract(nft.address);
		expect(await market.isWhitelisted(nft.address)).to.equal(true);

		console.log(
			"Gas cost: " +
				(await nft.estimateGas.sellMultipleNFTs(tokenIds, prices)).toString()
		);
		await nft.sellMultipleNFTs(tokenIds, prices);

		for (let i = 0; i < tokenIds.length; i++) {
			const { seller, price } = await market.tokensForSale(
				nft.address,
				tokenIds[i]
			);

			expect(seller).to.equal(owner.address);
			expect(price).to.equal(prices[i]);
		}
	});

	it("should cancelNFTSale", async () => {});

	it("should cancelMultipleNFTSales", async () => {});

	it("should purchase NFT", async () => {});
});
