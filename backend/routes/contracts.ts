import express from "express";
import { getAddress, isAddress } from "ethers/lib/utils";
import {
	removeNFTListener,
	removeStakingListener
} from "../helpers/removeContractListeners";
import { nftListener } from "../helpers/NFTs/nftListener";
import { admin } from "../middleware/admin";
import { verifyToken } from "../middleware/verifyToken";
import { Contract } from "../models/contract";
const router = express.Router();

// Returns all NFT & Staking contracts
router.get("/all", async (req, res) => {
	try {
		const id = await Contract.find().select("_id");
		const result = await Contract.findById(id).select("nft staking");

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
router.post("/newNFTContract", verifyToken, admin, async (req, res) => {
	try {
		const address = getAddress(req.body.address.toLowerCase()); // checksums address
		const validAddress = isAddress(address);
		if (!validAddress) return res.status(400).json("Invalid ETH address!");

		const exists = await Contract.findOne({
			nft: { $in: [address] }
		});
		if (exists) return res.status(400).json("Address already in database!");

		const id = await Contract.find().select("_id");

		let contract = await Contract.findByIdAndUpdate(
			id,
			{ $push: { nft: address } },
			{ new: true }
		).select("nft");

		if (!contract) {
			contract = new Contract({ nft: [address] });
			contract = await contract.save();
		}

		// Creates a event listener for the new contract address
		nftListener(address);

		res.json(contract);
	} catch (e) {
		console.error(e);
		res.status(400).json(e);
	}
});

// Adds/Whitelists a new Staking address.
// Must be passed in as a string, not an array.
router.post("/newStakingContract", verifyToken, admin, async (req, res) => {
	try {
		const address = getAddress(req.body.address.toLowerCase()); // checksums address
		const validAddress = isAddress(address);
		if (!validAddress) return res.status(400).json("Invalid ETH address!");

		const exists = await Contract.findOne({
			staking: { $in: [address] }
		});
		if (exists) return res.status(400).json("Address already in database!");

		const id = await Contract.find().select("_id");

		let contract = await Contract.findByIdAndUpdate(
			id,
			{ $push: { staking: address } },
			{ new: true }
		).select("staking");

		if (!contract) {
			contract = new Contract({ staking: [address] });
			contract = await contract.save();
		}

		res.json(contract);
	} catch (e) {
		console.error(e);
		res.status(400).json(e);
	}
});

// Removes an NFT contract address
router.put("/removeNFTContract", verifyToken, admin, async (req, res) => {
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

// Removes a Staking contract address
router.put("/removeStakingContract", verifyToken, admin, async (req, res) => {
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
