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

		const ERC20Factory = new ERC20Token__factory(owner);
		token = await ERC20Factory.deploy("Testing", "TEST");
		token2 = token.connect(bob);

		const MarketFactory = new Marketplace__factory(owner);
		market = await MarketFactory.deploy(chad.address, token.address, 5);
		market2 = market.connect(bob);
	});
});
