import { BigNumberish } from "ethers";
import { Listing } from "../../models/listing";

export async function listedForSale(
	nftContract: string,
	seller: string,
	tokenId: BigNumberish,
	price: BigNumberish
) {
	// Converts them to strings due to the possibility of being over JS's MAX_SAFE_INT
	tokenId = String(tokenId);
	price = String(price);

	try {
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
