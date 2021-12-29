import express from "express";
import { marketplaceContract } from "../helpers/contracts";
import { Listing } from "../models/listing";
const router = express.Router();

// Returns all the NFTs sold by the owner.
router.get("/soldBy/:contractAddress/:ownerAddress", async (req, res) => {
	try {
		const filterFrom = marketplaceContract.filters.Purchased(
			null,
			null,
			req.params.ownerAddress
		);

		const logsFrom = await marketplaceContract.queryFilter(
			filterFrom,
			0,
			"latest"
		);
		res.json(logsFrom);
	} catch (e) {
		console.error(e);
		res.status(400).json(e);
	}
});

router.get("/allForSale", async (req, res) => {
	try {
		const listings = await Listing.find().select("-__v");
		if (!listings.length) return res.status(404).json("No NFTs are for sale");

		res.json(listings);
	} catch (e) {
		console.error(e);
		res.status(400).json(e);
	}
});

router.get("/", async (req, res) => {
	try {
	} catch (e) {
		console.error(e);
		res.status(400).json(e);
	}
});

router.post("/", async (req, res) => {
	try {
	} catch (e) {
		console.error(e);
		res.status(400).json(e);
	}
});

router.put("/", async (req, res) => {});

router.delete("/", async (req, res) => {});

export default router;
