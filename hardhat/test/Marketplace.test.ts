import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { parseEther } from "ethers/lib/utils";
import { Marketplace__factory, Marketplace } from "../typechain-types/index";

describe("Marketplace", function () {
	const oneEther = parseEther("1");
	let owner: SignerWithAddress,
		bob: SignerWithAddress,
		contract: Marketplace,
		contract2: Marketplace;

	beforeEach(async function () {
		[owner, bob] = await ethers.getSigners();
		const ContractFactory = new Marketplace__factory(owner);
		contract = await ContractFactory.deploy("Hello");
		contract2 = contract.connect(bob);
	});
});
