import express from "express";
import { marketplaceContract } from "../helpers/contracts";
import { Contract } from "../models/contract";
const router = express.Router();

router.get("", async (req, res) => {});

router.get("/", async (req, res) => {});

router.post("/newNFTContract", async (req, res) => {
	try {
		// Make sure this is an ID
		const id = await Contract.find().select("_id");
		const result = await Contract.findByIdAndUpdate(id, {
			$push: { nft: req.body.nft }
		});
		res.json(result);
	} catch (e) {
		console.error(e);
		res.json(e);
	}
});

router.put("/", async (req, res) => {});

router.delete("/", async (req, res) => {});

export default router;
