import express from "express";
const router = express.Router();

router.post("/", async (req, res) => {
	try {
	} catch (e) {
		console.error(e);
		res.status(400).json(e);
	}
});

export default router;
