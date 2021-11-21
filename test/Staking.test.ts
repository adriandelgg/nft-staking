import { expect } from 'chai';
import { ethers } from 'hardhat';
import { parseEther } from '@ethersproject/units';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import {
	Staking__factory,
	Staking,
	NFTs__factory,
	NFTs,
	ERC20Token__factory,
	ERC20Token
} from '../typechain-types/index';
import { BigNumber } from '@ethersproject/bignumber';

describe('Staking', function () {
	const oneEther = parseEther('1');
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
		await nft.mintBatch(owner.address, [0, 1, 2, 3, 4], [1, 1, 1, 1, 1], []);
		for (let i = 0; i <= 4; i++) {
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
				(await nft.estimateGas.stakeMultipleNFTs([0, 1, 2, 3, 4])).toString()
		);

		await nft.stakeMultipleNFTs([0, 1, 2, 3, 4]);
		expect(await stake.totalNFTsStaked()).to.equal(5);

		for (let i = 0; i <= 4; i++) {
			expect(await nft.balanceOf(owner.address, i)).to.equal(0);
			expect(await nft.balanceOf(stake.address, i)).to.equal(1);
		}
	});

	// Unpaid because it was unstaked in the same block
	it('should unstake 1 NFT without pay', async () => {
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

	it('should unstake 1 NFT with pay', async () => {
		await nft.safeTransferFrom(owner.address, bob.address, 0, 1, []);
		expect(await nft.balanceOf(bob.address, 0)).to.equal(1);
		expect(await token.balanceOf(bob.address)).to.equal(0);

		await nft2.stakeNFT(0);
		expect(await stake.totalNFTsStaked()).to.equal(1);

		const { stakedFromBlock } = await stake.receipt(0);

		// Transaction to force new blocks
		for (let i = 0; i < 5; i++) {
			await token.setStakingContract(stake.address);
		}

		const { blockNumber } = await stake2.unstakeNFT(0);
		expect(await stake.totalNFTsStaked()).to.equal(0);
		expect(await nft.balanceOf(bob.address, 0)).to.equal(1);

		const timeStaked = BigNumber.from(blockNumber).sub(stakedFromBlock).sub(1);
		console.log(timeStaked.toString());

		// expect(await token.balanceOf(bob.address)).to.equal(0);
	});

	it('should unstake multiple NFTs without pay', async () => {});

	it('should unstake multiple NFTs with pay', async () => {});

	it('should withdraw rewards but not the NFT', async () => {});
});
