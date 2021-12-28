import express from "express";
import { marketplaceContract } from "../helpers/contracts";
import { NFTOwner } from "../models/nftOwner";
const router = express.Router();

// Returns all TokenIDs for the given owner's address
router.get("/allIDs/:userAddress", async (req, res) => {
	const nfts = await NFTOwner.findOne({ owner: req.params.userAddress }).select(
		"nft -_id"
	);
	if (!nfts) return res.json("User doesn't own any NFTs");

	res.json(nfts);
});

// Returns all TokenIDs for the given contract address & owner
router.get("/tokenIds/:contractAddress/:userAddress", async (req, res) => {
	const { contractAddress, userAddress } = req.params;

	const nfts = await NFTOwner.findOne({
		owner: userAddress,
		"contract.address": contractAddress
	}).select("nft -_id");

	if (!nfts) return res.json("User doesn't own any NFTs");
	res.json(nfts);
});

router.post("/", async (req, res) => {});

router.put("/", async (req, res) => {});

router.delete("/", async (req, res) => {});

export default router;
