import { expect } from 'chai';
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { Staking__factory, Staking } from '../typechain-types/index';

describe('Staking', function () {
	const oneEther = ethers.utils.parseEther('1');
	let owner: SignerWithAddress,
		bob: SignerWithAddress,
		contract: Staking,
		contract2: Staking;

	beforeEach(async function () {
		[owner, bob] = await ethers.getSigners();
		const ContractFactory = new Staking__factory(owner);
		contract = await ContractFactory.deploy('Hello');
		contract2 = contract.connect(bob);
	});
});
