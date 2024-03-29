import express from 'express';
import { marketplaceContract } from '../helpers/connections';
const router = express.Router();

// Returns all events where the buyer bought an NFT from oldest to newest
router.get('/allPurchasedByBuyer/:buyerAddress', async (req, res) => {
	try {
		const filterFrom = marketplaceContract.filters.Purchased(
			null,
			null,
			req.params.buyerAddress
		);

		const logsFrom = await marketplaceContract.queryFilter(filterFrom);

		const results = logsFrom.map(
			({ args: [nftContract, seller, buyer, tokenId, price] }) => ({
				nftContract,
				seller,
				buyer,
				tokenId,
				price
			})
		);

		if (!results.length) {
			return res.status(404).json('This address has not purchased any NFTs.');
		}

		res.json(results);
	} catch (e) {
		console.error(e);
		res.status(400).json(e);
	}
});

// Returns all the events where the seller completed a sale from oldest to newest
router.get('/allSoldBySeller/:sellerAddress', async (req, res) => {
	try {
		const filterFrom = marketplaceContract.filters.Purchased(
			null,
			req.params.sellerAddress
		);

		const logsFrom = await marketplaceContract.queryFilter(filterFrom);

		const results = logsFrom.map(
			({ args: [nftContract, seller, buyer, tokenId, price] }) => ({
				nftContract,
				seller,
				buyer,
				tokenId,
				price
			})
		);

		if (!results.length) {
			return res.status(404).json('This address has not sold any NFTs.');
		}

		res.json(results);
	} catch (e) {
		console.error(e);
		res.status(400).json(e);
	}
});

export default router;
