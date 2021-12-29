import express from "express";
import { marketplaceContract } from "../helpers/contracts";
const router = express.Router();

// Returns all the NFTs sold by the owner.
router.get("/soldBy/:contractAddress/:ownerAddress", async (req, res) => {
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
});

router.post("/", async (req, res) => {});

router.put("/", async (req, res) => {});

router.delete("/", async (req, res) => {});

export default router;
