import express from "express";
import { INFTOwner, NFTOwner } from "../models/nftOwner";
const router = express.Router();

// Returns all TokenIDs for the given owner's address
router.get("/allIDs/:userAddress", async (req, res) => {
	try {
		const nfts = await NFTOwner.findOne({
			owner: req.params.userAddress
		}).select("nft -_id");
		if (!nfts) return res.status(404).json("User doesn't own any NFTs");

		res.json(nfts);
	} catch (e) {
		console.error(e);
		res.status(400).json(e);
	}
});

// Returns all TokenIDs for the given contract address & owner
router.get("/tokenIds/:contractAddress/:userAddress", async (req, res) => {
	try {
		const { contractAddress, userAddress } = req.params;

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
});

// Returns all Owners that own tokens from the contract address
router.get("/allOwnersForContract/:contractAddress", async (req, res) => {
	try {
		const ids = await NFTOwner.find({
			"contract.address": req.params.contractAddress
		});

		if (!ids.length) {
			return res.status(404).json("No Owners found for the given contract .");
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
		const ids = await NFTOwner.find({
			"contract.address": req.params.contractAddress
		}).select("contract.tokenIds -_id");

		if (!ids.length) {
			return res
				.status(404)
				.json("No Token IDs found for the given contract .");
		}

		const allIds = ids.flatMap(({ contract: [{ tokenIds }] }) => tokenIds);

		res.json(allIds);
	} catch (e) {
		console.error(e);
		res.status(400).json(e);
	}
});

router.post("/", async (req, res) => {});

router.put("/", async (req, res) => {});

router.delete("/", async (req, res) => {});

export default router;
