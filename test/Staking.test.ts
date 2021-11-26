import { expect } from 'chai';
import { ethers, network } from 'hardhat';
import { parseEther } from '@ethersproject/units';
import { BigNumber } from '@ethersproject/bignumber';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
	Staking__factory,
	Staking,
	NFTs__factory,
	NFTs,
	ERC20Token__factory,
	ERC20Token
} from '../typechain-types/index';

describe('Staking', function () {
	const oneEther = parseEther('1');
	const tokenIds = [0, 1, 2, 3, 4];
	const amounts = [1, 1, 1, 1, 1];
	let owner: SignerWithAddress,
		bob: SignerWithAddress,
		nft: NFTs,
		nft2: NFTs,
		stake: Staking,
		stake2: Staking,
		token: ERC20Token,
		token2: ERC20Token;

	beforeEach(async function () {
		[owner, bob] = await ethers.getSigners();
		const NFTFactory = new NFTs__factory(owner);
		nft = await NFTFactory.deploy();
		nft2 = nft.connect(bob);

		const ERC20Factory = new ERC20Token__factory(owner);
		token = await ERC20Factory.deploy('Testing', 'TEST');
		token2 = token.connect(bob);

		const StakingFactory = new Staking__factory(owner);
		stake = await StakingFactory.deploy(
			nft.address,
			token.address,
			parseEther('1')
		);
		stake2 = stake.connect(bob);

		await token.setStakingContract(stake.address);
		expect(await token.balanceOf(stake.address)).to.equal(parseEther('20'));
		await nft.setStakingContract(stake.address);
		await nft.mintBatch(owner.address, tokenIds, amounts, []);
		for (let i = 0; i < 5; i++) {
			expect(await nft.balanceOf(owner.address, i)).to.equal(1);
		}

		// Staking contract holds 10 whole ERC20 tokens
		await token.transfer(stake.address, oneEther.mul(10));
		expect(await token.balanceOf(owner.address)).to.equal(parseEther('10'));
		expect(await stake.totalNFTsStaked()).to.equal(0);
	});

	xit('should stake 1 NFT', async () => {
		console.log('Gas cost: ' + (await nft.estimateGas.stakeNFT(0)).toString());
		await nft.stakeNFT(0);

		expect(await nft.balanceOf(owner.address, 0)).to.equal(0);
		expect(await nft.balanceOf(stake.address, 0)).to.equal(1);
		expect(await stake.totalNFTsStaked()).to.equal(1);
	});

	xit('should stake multiple NFTs', async () => {
		console.log(
			'Gas cost: ' +
				(await nft.estimateGas.stakeMultipleNFTs(tokenIds)).toString()
		);

		await nft.stakeMultipleNFTs(tokenIds);
		expect(await stake.totalNFTsStaked()).to.equal(5);

		for (let i = 0; i < 5; i++) {
			expect(await nft.balanceOf(owner.address, i)).to.equal(0);
			expect(await nft.balanceOf(stake.address, i)).to.equal(1);
		}
	});

	xit('should unstake 1 NFT with pay', async () => {
		await nft.safeTransferFrom(owner.address, bob.address, 0, 1, []);
		expect(await nft.balanceOf(bob.address, 0)).to.equal(1);
		expect(await token.balanceOf(bob.address)).to.equal(0);

		await nft2.stakeNFT(0);
		expect(await stake.totalNFTsStaked()).to.equal(1);

		const { stakedFromBlock } = await stake.receipt(0);

		// Force new blocks
		for (let i = 0; i < 4; i++) {
			await network.provider.send('evm_mine');
		}

		const { blockNumber } = await stake2.unstakeNFT(0);
		expect(await stake.totalNFTsStaked()).to.equal(0);
		expect(await nft.balanceOf(bob.address, 0)).to.equal(1);

		const timeStaked = BigNumber.from(blockNumber).sub(stakedFromBlock).sub(1);
		const tokensPerBlock = await stake.tokensPerBlock();
		const payout = timeStaked.mul(tokensPerBlock);

		expect(await token.balanceOf(bob.address)).to.equal(payout);
	});

	// Unpaid because it was unstaked in the same block
	xit('should unstake 1 NFT without pay', async () => {
		await nft.safeTransferFrom(owner.address, bob.address, 0, 1, []);
		expect(await nft.balanceOf(bob.address, 0)).to.equal(1);
		expect(await token.balanceOf(bob.address)).to.equal(0);

		await nft2.stakeNFT(0);
		expect(await stake.totalNFTsStaked()).to.equal(1);
		await expect(stake.unstakeNFT(0)).to.be.revertedWith(
			'onlyStaker: Caller is not NFT stake owner'
		);

		await stake2.unstakeNFT(0);
		expect(await stake.totalNFTsStaked()).to.equal(0);
		expect(await nft.balanceOf(bob.address, 0)).to.equal(1);
		expect(await token.balanceOf(bob.address)).to.equal(0);
	});

	xit('should unstake multiple NFTs with pay', async () => {
		await nft.safeBatchTransferFrom(
			owner.address,
			bob.address,
			tokenIds,
			amounts,
			[]
		);
		for (let i = 0; i < 5; i++) {
			expect(await nft.balanceOf(bob.address, i)).to.equal(1);
			expect(await nft.balanceOf(stake.address, i)).to.equal(0);
		}

		await nft2.stakeMultipleNFTs(tokenIds);
		expect(await stake.totalNFTsStaked()).to.equal(5);

		let stakedBlocks = BigNumber.from(0);
		for (let i = 0; i < tokenIds.length; i++) {
			// Adds up all the blocks
			const { stakedFromBlock } = await stake.receipt(i);
			stakedBlocks = stakedBlocks.add(stakedFromBlock);

			expect(await nft.balanceOf(bob.address, i)).to.equal(0);
			expect(await nft.balanceOf(stake.address, i)).to.equal(1);
			await network.provider.send('evm_mine'); // Force new blocks
		}

		const { blockNumber } = await stake2.unstakeMultipleNFTs(tokenIds);

		const timeStaked = BigNumber.from(blockNumber).sub(stakedBlocks).sub(1);
		const tokensPerBlock = await stake.tokensPerBlock();
		const payout = timeStaked.mul(tokensPerBlock);

		expect(await token.balanceOf(bob.address)).to.not.equal(payout);
	});

	// Lets you unstake NFTs without pay if on the same block
	xit('should unstake multiple NFTs without pay', async () => {
		await nft.safeBatchTransferFrom(
			owner.address,
			bob.address,
			tokenIds,
			amounts,
			[]
		);
		for (let i = 0; i < 5; i++) {
			expect(await nft.balanceOf(bob.address, i)).to.equal(1);
			expect(await nft.balanceOf(stake.address, i)).to.equal(0);
		}

		await nft2.stakeMultipleNFTs(tokenIds);
		expect(await stake.totalNFTsStaked()).to.equal(5);

		await stake2.unstakeMultipleNFTs(tokenIds);
		expect(await token.balanceOf(bob.address)).to.equal(0);
	});

	xit('should withdraw rewards but not the NFT', async () => {
		await nft.safeBatchTransferFrom(
			owner.address,
			bob.address,
			tokenIds,
			amounts,
			[]
		);
		for (let i = 0; i < 5; i++) {
			expect(await nft.balanceOf(bob.address, i)).to.equal(1);
			expect(await nft.balanceOf(stake.address, i)).to.equal(0);
		}

		await nft2.stakeMultipleNFTs(tokenIds);
		expect(await stake.totalNFTsStaked()).to.equal(5);

		let stakedBlocks = BigNumber.from(0);
		for (let i = 0; i < 5; i++) {
			// Adds up all the blocks
			const { stakedFromBlock } = await stake.receipt(i);
			stakedBlocks = stakedBlocks.add(stakedFromBlock);

			expect(await nft.balanceOf(bob.address, i)).to.equal(0);
			expect(await nft.balanceOf(stake.address, i)).to.equal(1);
			await network.provider.send('evm_mine'); // Force new blocks
		}

		const { blockNumber } = await stake2.withdrawRewards(tokenIds);

		const timeStaked = BigNumber.from(blockNumber).sub(stakedBlocks).sub(1);
		const tokensPerBlock = await stake.tokensPerBlock();
		const payout = timeStaked.mul(tokensPerBlock);

		expect(await token.balanceOf(bob.address)).to.not.equal(payout);

		// Makes sure contract still holds NFTs
		for (let i = 0; i < 4; i++) {
			const { stakedFromBlock } = await stake.receipt(i);
			expect(stakedFromBlock).to.equal(blockNumber);
			expect(await nft.balanceOf(stake.address, i)).to.equal(1);
		}
	});

	it('should keep track of NFTs staked and unstaked in mapping array', async () => {
		await nft.safeBatchTransferFrom(
			owner.address,
			bob.address,
			tokenIds,
			amounts,
			[]
		);
		for (let i = 0; i < 5; i++) {
			expect(await nft.balanceOf(bob.address, i)).to.equal(1);
			expect(await nft.balanceOf(stake.address, i)).to.equal(0);
		}

		await nft2.stakeMultipleNFTs(tokenIds);
		expect(await stake.totalNFTsStaked()).to.equal(5);
		for (let i = 0; i < 5; i++) {
			expect(await stake.stakedNFTs(bob.address, i)).to.equal(i);
		}
		expect(await stake.totalNFTsUserStaked(bob.address)).to.equal(5);

		await stake2.unstakeNFT(0);
		expect(await stake.totalNFTsUserStaked(bob.address)).to.equal(4);

		await nft2.stakeNFT(0);
		expect(await stake.totalNFTsUserStaked(bob.address)).to.equal(5);

		await stake2.unstakeMultipleNFTs(tokenIds);
		expect(await stake.totalNFTsUserStaked(bob.address)).to.equal(0);
	});
});
