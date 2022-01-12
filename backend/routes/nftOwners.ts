import express from "express";
import { getAddress, isAddress } from "ethers/lib/utils";
import { NFTOwner } from "../models/nftOwner";
const router = express.Router();

// Returns all owned TokenIDs for the given owner's address
router.get("/allIDs/:userAddress", async (req, res) => {
	try {
		const address = getAddress(req.params.userAddress.toLowerCase()); // checksums address
		const validAddress = isAddress(address);
		if (!validAddress) return res.status(400).json("Invalid ETH address!");

		const nfts = await NFTOwner.findOne({
			owner: address
		}).select("nft -_id");
		if (!nfts) return res.status(404).json("User doesn't own any NFTs");

		res.json(nfts);
	} catch (e) {
		console.error(e);
		res.status(400).json(e);
	}
});

// Returns all TokenIDs for the given contract address & owner
router.get(
	"/allUsersIDsForContract/:contractAddress/:userAddress",
	async (req, res) => {
		try {
			const contractAddress = getAddress(
				req.params.contractAddress.toLowerCase()
			); // checksums address
			let validAddress = isAddress(contractAddress);
			if (!validAddress) {
				return res.status(400).json("Invalid ETH contract address!");
			}

			const userAddress = getAddress(req.params.userAddress.toLowerCase()); // checksums address
			validAddress = isAddress(userAddress);
			if (!validAddress) {
				return res.status(400).json("Invalid ETH user address!");
			}

			const nfts = await NFTOwner.findOne({
				owner: userAddress,
				"contract.address": contractAddress
			}).select("nft -_id");

			if (!nfts) return res.status(404).json("User doesn't own any NFTs");
			res.json(nfts);
		} catch (e) {
			console.error(e);
			res.status(400).json(e);
		}
	}
);

// Returns all Owners that own tokens from the contract address
router.get("/allOwnersForContract/:contractAddress", async (req, res) => {
	try {
		const address = getAddress(req.params.contractAddress.toLowerCase()); // checksums address
		const validAddress = isAddress(address);
		if (!validAddress) return res.status(400).json("Invalid ETH address!");

		const ids = await NFTOwner.find({
			"contract.address": address
		});

		if (!ids.length) {
			return res.status(404).json("No Owners found for the given contract.");
		}

		res.json(ids);
	} catch (e) {
		console.error(e);
		res.status(400).json(e);
	}
});

// Returns all Token IDs for the contract address
router.get("/allIDsForContract/:contractAddress", async (req, res) => {
	try {
		const address = getAddress(req.params.contractAddress.toLowerCase()); // checksums address
		const validAddress = isAddress(address);
		if (!validAddress) return res.status(400).json("Invalid ETH address!");

		const ids = await NFTOwner.find({
			"contract.address": address
		}).select("contract.tokenIds -_id");

		if (!ids.length) {
			return res.status(404).json("No Token IDs found for the given contract.");
		}

		const allIds = ids.flatMap(({ contract: [{ tokenIds }] }) => tokenIds);

		res.json(allIds);
	} catch (e) {
		console.error(e);
		res.status(400).json(e);
	}
});

export default router;
