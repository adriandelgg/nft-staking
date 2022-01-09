import express from "express";
import { Listing } from "../models/listing";
const router = express.Router();

// Returns all NFTs that are for sale
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

// Returns all the NFTs sold by the owner.
router.get("/allForSaleBy/:sellerAddress", async (req, res) => {
	try {
		const listings = await Listing.find({
			seller: req.params.sellerAddress
		}).select("-__v");
		if (!listings.length) return res.status(404).json("No NFTs are for sale");

		res.json(listings);
	} catch (e) {
		console.error(e);
		res.status(400).json(e);
	}
});

export default router;
