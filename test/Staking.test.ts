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
			parseEther('0.02')
		);
		stake2 = stake.connect(bob);

		await nft.setStakingContract(stake.address);

		// Staking contract holds 10 whole ERC20 tokens
		await token.transfer(stake.address, oneEther.mul(10));
		expect(await token.balanceOf(owner.address)).to.equal(parseEther('10'));
	});

	it('should transfer NFT to stake contract', async () => {
		await nft.mint(owner.address, 0, 1, []);
		expect(await nft.balanceOf(owner.address, 0)).to.equal(1);
		console.log('Gas cost: ' + (await nft.estimateGas.stakeNFT(0)).toString());
		await nft.stakeNFT(0);

		expect(await nft.balanceOf(owner.address, 0)).to.equal(0);
		expect(await nft.balanceOf(stake.address, 0)).to.equal(1);
		// await stake.stakeNFT();
	});

	it('should transfer multiple NFTs to stake contract', async () => {
		await nft.mintBatch(owner.address, [0, 1, 2, 3, 4], [1, 1, 1, 1, 1], []);
		for (let i = 0; i <= 4; i++) {
			expect(await nft.balanceOf(owner.address, i)).to.equal(1);
		}

		console.log(
			'Gas cost: ' +
				(await nft.estimateGas.stakeMultipleNFTs([0, 1, 2, 3, 4])).toString()
		);

		await nft.stakeMultipleNFTs([0, 1, 2, 3, 4]);
		for (let i = 0; i <= 4; i++) {
			expect(await nft.balanceOf(owner.address, i)).to.equal(0);
			expect(await nft.balanceOf(stake.address, i)).to.equal(1);
		}
	});
});