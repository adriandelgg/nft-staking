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
		staking: Staking,
		staking2: Staking,
		token: ERC20Token,
		token2: ERC20Token;

	beforeEach(async function () {
		[owner, bob] = await ethers.getSigners();
		const NFTFactory = new NFTs__factory(owner);
		nft = await NFTFactory.deploy();
		nft2 = nft.connect(bob);

		const ERC20Factory = new ERC20Token__factory(owner);
		token = await ERC20Factory.deploy('Testing', 'TEST');
		token2 = nft.connect(bob);

		const StakingFactory = new Staking__factory(owner);
		staking = await StakingFactory.deploy(
			nft.address,
			token.address,
			parseEther('0.02')
		);
		staking2 = staking.connect(bob);
	});
});
