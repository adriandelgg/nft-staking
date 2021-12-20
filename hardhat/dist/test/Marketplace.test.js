"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const hardhat_1 = require("hardhat");
const utils_1 = require("ethers/lib/utils");
const index_1 = require("../typechain-types/index");
const oneEther = (0, utils_1.parseEther)("1");
const tokenIds = [0, 1, 2, 3, 4];
const amounts = [1, 1, 1, 1, 1];
const prices = [1e5, 2e5, 3e5, 4e5, 5e5];
const zeroAddress = "0x0000000000000000000000000000000000000000";
describe("Marketplace", function () {
    let owner, bob, chad, market, market2, nft, nft2, token, token2;
    beforeEach(async function () {
        [owner, bob, chad] = await hardhat_1.ethers.getSigners();
        const NFTFactory = new index_1.NFTs__factory(owner);
        nft = await NFTFactory.deploy();
        nft2 = nft.connect(bob);
        await nft.mintBatch(owner.address, tokenIds, amounts, []);
        for (let i = 0; i < 5; i++) {
            (0, chai_1.expect)(await nft.balanceOf(owner.address, i)).to.equal(1);
        }
        const ERC20Factory = new index_1.ERC20Token__factory(owner);
        token = await ERC20Factory.deploy("Testing", "TEST");
        token2 = token.connect(bob);
        const MarketFactory = new index_1.Marketplace__factory(owner);
        market = await MarketFactory.deploy(token.address, chad.address, 5);
        market2 = market.connect(bob);
        await nft.setMarketplaceContract(market.address);
        (0, chai_1.expect)(await nft.marketplaceContract()).to.equal(market.address);
    });
    describe("Setting Values", () => {
        it("should setFeeCollector", async () => {
            (0, chai_1.expect)(await market.feeCollector()).to.equal(chad.address);
            console.log("Gas cost: " +
                (await market.estimateGas.setFeeCollector(owner.address)).toString());
            await market.setFeeCollector(owner.address);
            (0, chai_1.expect)(await market.feeCollector()).to.equal(owner.address);
        });
        it("should setERC20Token", async () => {
            (0, chai_1.expect)(await market.erc20Token()).to.equal(token.address);
            console.log("Gas cost: " +
                (await market.estimateGas.setERC20Token(owner.address)).toString());
            await market.setERC20Token(owner.address);
            (0, chai_1.expect)(await market.erc20Token()).to.equal(owner.address);
        });
        it("should setFeeAmount", async () => {
            (0, chai_1.expect)(await market.feeAmount()).to.equal(5);
            console.log("Gas cost: " + (await market.estimateGas.setFeeAmount(10)).toString());
            await market.setFeeAmount(10);
            (0, chai_1.expect)(await market.feeAmount()).to.equal(10);
        });
        it("should whitelistNFT", async () => {
            (0, chai_1.expect)(await market.totalNFTContracts()).to.equal(0);
            (0, chai_1.expect)(await market.isWhitelisted(nft.address)).to.equal(false);
            console.log("Gas cost: " +
                (await market.estimateGas.whitelistNFTContract(nft.address)).toString());
            await market.whitelistNFTContract(nft.address);
            await (0, chai_1.expect)(market.whitelistNFTContract(nft.address)).to.be.revertedWith("NFT contract is already whitelisted");
            (0, chai_1.expect)(await market.totalNFTContracts()).to.equal(1);
            (0, chai_1.expect)(await market.isWhitelisted(nft.address)).to.equal(true);
        });
        it("should unwhitelistNFT", async () => {
            (0, chai_1.expect)(await market.totalNFTContracts()).to.equal(0);
            (0, chai_1.expect)(await market.isWhitelisted(nft.address)).to.equal(false);
            await market.whitelistNFTContract(nft.address);
            (0, chai_1.expect)(await market.totalNFTContracts()).to.equal(1);
            (0, chai_1.expect)(await market.isWhitelisted(nft.address)).to.equal(true);
            console.log("Gas cost: " +
                (await market.estimateGas.unwhitelistNFTContract(nft.address)).toString());
            await market.unwhitelistNFTContract(nft.address);
            (0, chai_1.expect)(await market.totalNFTContracts()).to.equal(0);
            (0, chai_1.expect)(await market.isWhitelisted(nft.address)).to.equal(false);
        });
    });
    describe("Selling, Cancelling, & Buying", () => {
        beforeEach(async function () {
            await (0, chai_1.expect)(nft.sellNFT(0, 1e5)).to.be.revertedWith("NFT contract address is not whitelisted!");
            (0, chai_1.expect)(await market.isWhitelisted(nft.address)).to.equal(false);
            await market.whitelistNFTContract(nft.address);
            (0, chai_1.expect)(await market.isWhitelisted(nft.address)).to.equal(true);
        });
        it("should list NFT for sale", async () => {
            console.log("Gas cost: " + (await nft.estimateGas.sellNFT(0, 1e5)).toString());
            (0, chai_1.expect)(await nft.balanceOf(owner.address, 0)).to.equal(1);
            (0, chai_1.expect)(await nft.balanceOf(market.address, 0)).to.equal(0);
            await nft.sellNFT(0, 1e5);
            (0, chai_1.expect)(await nft.balanceOf(owner.address, 0)).to.equal(0);
            (0, chai_1.expect)(await nft.balanceOf(market.address, 0)).to.equal(1);
            const { seller, price } = await market.tokensForSale(nft.address, 0);
            (0, chai_1.expect)(seller).to.equal(owner.address);
            (0, chai_1.expect)(price).to.equal(1e5);
        });
        it("should sellMultipleNFTs", async () => {
            console.log("Gas cost: " +
                (await nft.estimateGas.sellMultipleNFTs(tokenIds, prices)).toString());
            await nft.sellMultipleNFTs(tokenIds, prices);
            for (let i = 0; i < tokenIds.length; i++) {
                const { seller, price } = await market.tokensForSale(nft.address, tokenIds[i]);
                (0, chai_1.expect)(await nft.balanceOf(owner.address, i)).to.equal(0);
                (0, chai_1.expect)(await nft.balanceOf(market.address, i)).to.equal(1);
                (0, chai_1.expect)(seller).to.equal(owner.address);
                (0, chai_1.expect)(price).to.equal(prices[i]);
            }
        });
        it("should cancelNFTSale", async () => {
            await nft.sellNFT(0, 1e5);
            (0, chai_1.expect)(await nft.balanceOf(owner.address, 0)).to.equal(0);
            (0, chai_1.expect)(await nft.balanceOf(market.address, 0)).to.equal(1);
            var { seller, price } = await market.tokensForSale(nft.address, 0);
            (0, chai_1.expect)(seller).to.equal(owner.address);
            (0, chai_1.expect)(price).to.equal(1e5);
            console.log("Gas cost: " +
                (await market.estimateGas.cancelNFTSale(nft.address, 0)).toString());
            await market.cancelNFTSale(nft.address, 0);
            (0, chai_1.expect)(await nft.balanceOf(owner.address, 0)).to.equal(1);
            (0, chai_1.expect)(await nft.balanceOf(market.address, 0)).to.equal(0);
            var { seller, price } = await market.tokensForSale(nft.address, 0);
            (0, chai_1.expect)(seller).to.equal(zeroAddress);
            (0, chai_1.expect)(price).to.equal(0);
        });
        it("should cancelMultipleNFTSales", async () => {
            await nft.sellMultipleNFTs(tokenIds, prices);
            for (let i = 0; i < tokenIds.length; i++) {
                const { seller, price } = await market.tokensForSale(nft.address, tokenIds[i]);
                (0, chai_1.expect)(seller).to.equal(owner.address);
                (0, chai_1.expect)(price).to.equal(prices[i]);
                (0, chai_1.expect)(await nft.balanceOf(owner.address, i)).to.equal(0);
                (0, chai_1.expect)(await nft.balanceOf(market.address, i)).to.equal(1);
            }
            console.log("Gas cost: " +
                (await market.estimateGas.cancelMultipleNFTSales(nft.address, tokenIds)).toString());
            await market.cancelMultipleNFTSales(nft.address, tokenIds);
            for (let i = 0; i < tokenIds.length; i++) {
                const { seller, price } = await market.tokensForSale(nft.address, tokenIds[i]);
                (0, chai_1.expect)(seller).to.equal(zeroAddress);
                (0, chai_1.expect)(price).to.equal(0);
                (0, chai_1.expect)(await nft.balanceOf(owner.address, i)).to.equal(1);
                (0, chai_1.expect)(await nft.balanceOf(market.address, i)).to.equal(0);
            }
        });
        it("should purchaseNFT", async () => {
            const salePrice = 1e5;
            await nft.sellNFT(0, salePrice);
            (0, chai_1.expect)(await nft.balanceOf(owner.address, 0)).to.equal(0);
            (0, chai_1.expect)(await nft.balanceOf(market.address, 0)).to.equal(1);
            await (0, chai_1.expect)(market.purchaseNFT(nft.address, 0)).to.be.revertedWith("You can NOT buy your own NFT");
            (0, chai_1.expect)(await token.balanceOf(chad.address)).to.equal(0);
            (0, chai_1.expect)(await nft.balanceOf(bob.address, 0)).to.equal(0);
            await token2.approve(market.address, await token2.totalSupply());
            console.log("Gas cost: " +
                (await market2.estimateGas.purchaseNFT(nft.address, 0)).toString());
            await market2.purchaseNFT(nft.address, 0);
            (0, chai_1.expect)(await nft.balanceOf(bob.address, 0)).to.equal(1);
            const { seller, price } = await market.tokensForSale(nft.address, 0);
            (0, chai_1.expect)(seller).to.equal(zeroAddress);
            (0, chai_1.expect)(price).to.equal(0);
            // Checks that address received fee
            (0, chai_1.expect)(await token.balanceOf(chad.address)).to.equal((await market.feeAmount()).mul(salePrice).div(100));
        });
    });
});
