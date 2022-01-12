import { BigNumberish } from "ethers";
import { Listing } from "../../models/listing";

/** Event listener for when a new NFT has been put up for sale */
export async function listedForSale(
	nftContract: string,
	seller: string,
	tokenId: BigNumberish,
	price: BigNumberish
) {
	try {
		// Converts them to strings due to the possibility of being over JS's MAX_SAFE_INT
		tokenId = String(tokenId);
		// Price is saved as string in Solidity Units to avoid MAX_SAFE_INT error. 1e9
		price = String(price);

		// 1. Check DB to see if the listing already exists
		const listingExists = await Listing.findOne({ nftContract, tokenId });
		// 2. If it does return
		if (listingExists) return console.log("Listing already exists");

		// 3. If it doesn't add it to the DB
		const listing = new Listing({ nftContract, seller, tokenId, price });
		await listing.save();
	} catch (e) {
		console.error(e);
	}
}
