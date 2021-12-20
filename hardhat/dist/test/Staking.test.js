"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const hardhat_1 = require("hardhat");
const units_1 = require("@ethersproject/units");
const bignumber_1 = require("@ethersproject/bignumber");
const index_1 = require("../typechain-types/index");
xdescribe("Staking", function () {
    const oneEther = (0, units_1.parseEther)("1");
    const tokenIds = [0, 1, 2, 3, 4];
    const amounts = [1, 1, 1, 1, 1];
    let owner, bob, nft, nft2, stake, stake2, token, token2;
    beforeEach(async function () {
        [owner, bob] = await hardhat_1.ethers.getSigners();
        const NFTFactory = new index_1.NFTs__factory(owner);
        nft = await NFTFactory.deploy();
        nft2 = nft.connect(bob);
        const ERC20Factory = new index_1.ERC20Token__factory(owner);
        token = await ERC20Factory.deploy("Testing", "TEST");
        token2 = token.connect(bob);
        const StakingFactory = new index_1.StakingArray__factory(owner);
        stake = await StakingFactory.deploy(nft.address, token.address, (0, units_1.parseEther)("1"));
        stake2 = stake.connect(bob);
        await token.setStakingContract(stake.address);
        (0, chai_1.expect)(await token.balanceOf(stake.address)).to.equal((0, units_1.parseEther)("20"));
        await nft.setStakingContract(stake.address);
        await nft.mintBatch(owner.address, tokenIds, amounts, []);
        for (let i = 0; i < 5; i++) {
            (0, chai_1.expect)(await nft.balanceOf(owner.address, i)).to.equal(1);
        }
        // Staking contract holds 10 whole ERC20 tokens
        await token.transfer(stake.address, oneEther.mul(10));
        (0, chai_1.expect)(await token.balanceOf(owner.address)).to.equal((0, units_1.parseEther)("10"));
        (0, chai_1.expect)(await stake.totalNFTsStaked()).to.equal(0);
    });
    it("should stake 1 NFT", async () => {
        console.log("Gas cost: " + (await nft.estimateGas.stakeNFT(0)).toString());
        await nft.stakeNFT(0);
        (0, chai_1.expect)(await nft.balanceOf(owner.address, 0)).to.equal(0);
        (0, chai_1.expect)(await nft.balanceOf(stake.address, 0)).to.equal(1);
        (0, chai_1.expect)(await stake.totalNFTsStaked()).to.equal(1);
    });
    it("should stake multiple NFTs", async () => {
        console.log("Gas cost: " +
            (await nft.estimateGas.stakeMultipleNFTs(tokenIds)).toString());
        await nft.stakeMultipleNFTs(tokenIds);
        (0, chai_1.expect)(await stake.totalNFTsStaked()).to.equal(5);
        for (let i = 0; i < 5; i++) {
            (0, chai_1.expect)(await nft.balanceOf(owner.address, i)).to.equal(0);
            (0, chai_1.expect)(await nft.balanceOf(stake.address, i)).to.equal(1);
        }
    });
    it("should unstake 1 NFT with pay", async () => {
        await nft.safeTransferFrom(owner.address, bob.address, 0, 1, []);
        (0, chai_1.expect)(await nft.balanceOf(bob.address, 0)).to.equal(1);
        (0, chai_1.expect)(await token.balanceOf(bob.address)).to.equal(0);
        await nft2.stakeNFT(0);
        (0, chai_1.expect)(await stake.totalNFTsStaked()).to.equal(1);
        const { stakedFromBlock } = await stake.receipt(0);
        // Force new blocks
        for (let i = 0; i < 4; i++) {
            await hardhat_1.network.provider.send("evm_mine");
        }
        const { blockNumber } = await stake2.unstakeNFT(0);
        (0, chai_1.expect)(await stake.totalNFTsStaked()).to.equal(0);
        (0, chai_1.expect)(await nft.balanceOf(bob.address, 0)).to.equal(1);
        const timeStaked = bignumber_1.BigNumber.from(blockNumber).sub(stakedFromBlock).sub(1);
        const tokensPerBlock = await stake.tokensPerBlock();
        const payout = timeStaked.mul(tokensPerBlock);
        (0, chai_1.expect)(await token.balanceOf(bob.address)).to.equal(payout);
    });
    // Unpaid because it was unstaked in the same block
    it("should unstake 1 NFT without pay", async () => {
        await nft.safeTransferFrom(owner.address, bob.address, 0, 1, []);
        (0, chai_1.expect)(await nft.balanceOf(bob.address, 0)).to.equal(1);
        (0, chai_1.expect)(await token.balanceOf(bob.address)).to.equal(0);
        await nft2.stakeNFT(0);
        (0, chai_1.expect)(await stake.totalNFTsStaked()).to.equal(1);
        await (0, chai_1.expect)(stake.unstakeNFT(0)).to.be.revertedWith("onlyStaker: Caller is not NFT stake owner");
        await stake2.unstakeNFT(0);
        (0, chai_1.expect)(await stake.totalNFTsStaked()).to.equal(0);
        (0, chai_1.expect)(await nft.balanceOf(bob.address, 0)).to.equal(1);
        (0, chai_1.expect)(await token.balanceOf(bob.address)).to.equal(0);
    });
    it("should unstake multiple NFTs with pay", async () => {
        await nft.safeBatchTransferFrom(owner.address, bob.address, tokenIds, amounts, []);
        for (let i = 0; i < 5; i++) {
            (0, chai_1.expect)(await nft.balanceOf(bob.address, i)).to.equal(1);
            (0, chai_1.expect)(await nft.balanceOf(stake.address, i)).to.equal(0);
        }
        await nft2.stakeMultipleNFTs(tokenIds);
        (0, chai_1.expect)(await stake.totalNFTsStaked()).to.equal(5);
        let stakedBlocks = bignumber_1.BigNumber.from(0);
        for (let i = 0; i < tokenIds.length; i++) {
            // Adds up all the blocks
            const { stakedFromBlock } = await stake.receipt(i);
            stakedBlocks = stakedBlocks.add(stakedFromBlock);
            (0, chai_1.expect)(await nft.balanceOf(bob.address, i)).to.equal(0);
            (0, chai_1.expect)(await nft.balanceOf(stake.address, i)).to.equal(1);
            await hardhat_1.network.provider.send("evm_mine"); // Force new blocks
        }
        const { blockNumber } = await stake2.unstakeMultipleNFTs(tokenIds);
        const timeStaked = bignumber_1.BigNumber.from(blockNumber).sub(stakedBlocks).sub(1);
        const tokensPerBlock = await stake.tokensPerBlock();
        const payout = timeStaked.mul(tokensPerBlock);
        (0, chai_1.expect)(await token.balanceOf(bob.address)).to.not.equal(payout);
    });
    // Lets you unstake NFTs without pay if on the same block
    it("should unstake multiple NFTs without pay", async () => {
        await nft.safeBatchTransferFrom(owner.address, bob.address, tokenIds, amounts, []);
        for (let i = 0; i < 5; i++) {
            (0, chai_1.expect)(await nft.balanceOf(bob.address, i)).to.equal(1);
            (0, chai_1.expect)(await nft.balanceOf(stake.address, i)).to.equal(0);
        }
        await nft2.stakeMultipleNFTs(tokenIds);
        (0, chai_1.expect)(await stake.totalNFTsStaked()).to.equal(5);
        await stake2.unstakeMultipleNFTs(tokenIds);
        (0, chai_1.expect)(await token.balanceOf(bob.address)).to.equal(0);
    });
    it("should withdraw rewards but not the NFT", async () => {
        await nft.safeBatchTransferFrom(owner.address, bob.address, tokenIds, amounts, []);
        for (let i = 0; i < 5; i++) {
            (0, chai_1.expect)(await nft.balanceOf(bob.address, i)).to.equal(1);
            (0, chai_1.expect)(await nft.balanceOf(stake.address, i)).to.equal(0);
        }
        await nft2.stakeMultipleNFTs(tokenIds);
        (0, chai_1.expect)(await stake.totalNFTsStaked()).to.equal(5);
        let stakedBlocks = bignumber_1.BigNumber.from(0);
        for (let i = 0; i < 5; i++) {
            // Adds up all the blocks
            const { stakedFromBlock } = await stake.receipt(i);
            stakedBlocks = stakedBlocks.add(stakedFromBlock);
            (0, chai_1.expect)(await nft.balanceOf(bob.address, i)).to.equal(0);
            (0, chai_1.expect)(await nft.balanceOf(stake.address, i)).to.equal(1);
            await hardhat_1.network.provider.send("evm_mine"); // Force new blocks
        }
        const { blockNumber } = await stake2.withdrawRewards(tokenIds);
        const timeStaked = bignumber_1.BigNumber.from(blockNumber).sub(stakedBlocks).sub(1);
        const tokensPerBlock = await stake.tokensPerBlock();
        const payout = timeStaked.mul(tokensPerBlock);
        (0, chai_1.expect)(await token.balanceOf(bob.address)).to.not.equal(payout);
        // Makes sure contract still holds NFTs
        for (let i = 0; i < 4; i++) {
            const { stakedFromBlock } = await stake.receipt(i);
            (0, chai_1.expect)(stakedFromBlock).to.equal(blockNumber);
            (0, chai_1.expect)(await nft.balanceOf(stake.address, i)).to.equal(1);
        }
    });
    it("should keep track of NFTs staked and unstaked in mapping array", async () => {
        await nft.safeBatchTransferFrom(owner.address, bob.address, tokenIds, amounts, []);
        for (let i = 0; i < 5; i++) {
            (0, chai_1.expect)(await nft.balanceOf(bob.address, i)).to.equal(1);
            (0, chai_1.expect)(await nft.balanceOf(stake.address, i)).to.equal(0);
        }
        await nft2.stakeMultipleNFTs(tokenIds);
        (0, chai_1.expect)(await stake.totalNFTsStaked()).to.equal(5);
        for (let i = 0; i < 5; i++) {
            (0, chai_1.expect)(await stake.stakedNFTs(bob.address, i)).to.equal(i);
        }
        (0, chai_1.expect)(await stake.totalNFTsUserStaked(bob.address)).to.equal(5);
        await stake2.unstakeNFT(0);
        (0, chai_1.expect)(await stake.totalNFTsUserStaked(bob.address)).to.equal(4);
        await nft2.stakeNFT(0);
        (0, chai_1.expect)(await stake.totalNFTsUserStaked(bob.address)).to.equal(5);
        await stake2.unstakeMultipleNFTs(tokenIds);
        (0, chai_1.expect)(await stake.totalNFTsUserStaked(bob.address)).to.equal(0);
    });
    it("should compare gas between withdrawing rewards with and without passing in an array", async () => {
        await nft.safeBatchTransferFrom(owner.address, bob.address, tokenIds, amounts, []);
        for (let i = 0; i < 5; i++) {
            (0, chai_1.expect)(await nft.balanceOf(bob.address, i)).to.equal(1);
            (0, chai_1.expect)(await nft.balanceOf(stake.address, i)).to.equal(0);
        }
        await nft2.stakeMultipleNFTs(tokenIds);
        await hardhat_1.network.provider.send("evm_mine");
        console.log((await stake2.estimateGas.withdrawRewards(tokenIds)).toString());
        console.log((await stake2.estimateGas.withdrawRewardsNoArray()).toString());
    });
});
