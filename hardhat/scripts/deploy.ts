// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import hre from "hardhat";

async function main() {
	// We get the contract to deploy
	const ERC20 = await hre.ethers.getContractFactory("ERC20Token");
	const erc20 = await ERC20.deploy("Test", "TEST");
	await erc20.deployed();

	const Marketplace = await hre.ethers.getContractFactory("Marketplace");
	const marketplace = await Marketplace.deploy(
		erc20.address,
		"0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
		2
	);
	await marketplace.deployed();

	const NFTs = await hre.ethers.getContractFactory("NFTs");
	const nfts = await NFTs.deploy(erc20.address, marketplace.address);
	await nfts.deployed();

	console.log("ERC20 deployed to:", erc20.address);
	console.log("Marketplace deployed to:", marketplace.address);
	console.log("NFTs deployed to:", nfts.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error);
		process.exit(1);
	});
