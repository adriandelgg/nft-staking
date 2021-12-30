import express from "express";
import { Contract } from "../models/contract";
import { nftListener } from "../helpers/NFTs/nftListener";
import {
	removeNFTListener,
	removeStakingListener
} from "../helpers/removeContractListeners";
const router = express.Router();

// Returns all NFT & Staking contracts
router.get("/all", async (req, res) => {
	try {
		const id = await Contract.find().select("_id");
		const result = await Contract.findById(id);

		if (!result) return res.status(404).json("None found");

		res.json(result);
	} catch (e) {
		console.error(e);
		res.status(400).json(e);
	}
});

// Returns all NFT contracts
router.get("/allNFT", async (req, res) => {
	try {
		const id = await Contract.find().select("_id");
		const result = await Contract.findById(id).select("nft");

		if (!result) return res.status(404).json("None found");

		res.json(result);
	} catch (e) {
		console.error(e);
		res.status(400).json(e);
	}
});

// Returns all Staking contracts
router.get("/allStaking", async (req, res) => {
	try {
		const id = await Contract.find().select("_id");
		const result = await Contract.findById(id).select("staking");

		if (!result) return res.status(404).json("None found");

		res.json(result);
	} catch (e) {
		console.error(e);
		res.status(400).json(e);
	}
});

// Adds/Whitelists a new NFT address.
// Must be passed in as a string, not an array.
router.post("/newNFTContract", async (req, res) => {
	try {
		// Make sure this is an ID
		const id = await Contract.find().select("_id");
		let contract = await Contract.findByIdAndUpdate(
			id,
			{ $push: { nft: req.body.address } },
			{ new: true }
		).select("nft");

		if (!contract) {
			contract = new Contract({ nft: [req.body.address] });
			contract = await contract.save();
		}

		// Creates a event listener for the new contract address
		nftListener(req.body.address);

		res.json(contract);
	} catch (e) {
		console.error(e);
		res.status(400).json(e);
	}
});

// Removes an NFT address
router.put("/removeNFTContract", async (req, res) => {
	try {
		// Make sure this is an ID
		const id = await Contract.find().select("_id");
		const result = await Contract.findByIdAndUpdate(
			id,
			{ $pull: { nft: req.body.address } },
			{ new: true }
		).select("nft");

		if (!result) {
			return res.status(404).json("No entry found with the given address.");
		}

		// Removes the event listeners for the removed NFT contract
		removeNFTListener(req.body.address);

		res.json(result);
	} catch (e) {
		console.error(e);
		res.status(400).json(e);
	}
});

// Removes an NFT address
router.put("/removeStakingContract", async (req, res) => {
	try {
		// Make sure this is an ID
		const id = await Contract.find().select("_id");
		const result = await Contract.findByIdAndUpdate(
			id,
			{ $pull: { staking: req.body.address } },
			{ new: true }
		).select("staking");

		if (!result) {
			return res.status(404).json("No entry found with the given address.");
		}

		// Removes the event listeners for the removed Staking contract
		removeStakingListener(req.body.address);

		res.json(result);
	} catch (e) {
		console.error(e);
		res.status(400).json(e);
	}
});

export default router;
