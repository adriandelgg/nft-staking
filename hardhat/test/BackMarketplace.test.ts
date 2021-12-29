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

const oneEther = parseEther("1");
const tokenIds = [0, 1, 2, 3, 4];
const amounts = [1, 1, 1, 1, 1];
const prices = [1e5, 2e5, 3e5, 4e5, 5e5];
const zeroAddress = "0x0000000000000000000000000000000000000000";

describe("Marketplace", function () {
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

		token = ERC20Token__factory.connect(
			"0x5FbDB2315678afecb367f032d93F642f64180aa3",
			owner
		);
		token2 = token.connect(bob);

		market = Marketplace__factory.connect(
			"0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
			owner
		);
		market2 = market.connect(bob);

		nft = NFTs__factory.connect(
			"0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
			owner
		);
		nft2 = nft.connect(bob);
	});

	it("should sync DB", async () => {
		// await nft.mint(owner.address, 2, 1, []);
		// await nft.safeTransferFrom(owner.address, bob.address, 2, 1, []);
		// await nft2.safeTransferFrom(bob.address, owner.address, 2, 1, []);
		// await market.whitelistNFTContract(nft2.address);
		// await nft2.sellNFT(2, 1e5);
		// await token.approve(market.address, 1e5);
		// await market.purchaseNFT(nft2.address, 2);
	});
});
