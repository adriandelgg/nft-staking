import { BigNumberish } from "ethers";
import { Listing } from "../../models/listing";

export async function purchased(
	nftContract: string,
	seller: string,
	buyer: string,
	tokenId: BigNumberish,
	price: BigNumberish
) {
	// Converts them to strings due to the possibility of being over JS's MAX_SAFE_INT
	tokenId = String(tokenId);
	price = String(price);
	try {
		// 1. Find tokenId & nftContract in the DB
		await Listing.findOneAndDelete({ nftContract, tokenId });
		// 2. If it doesn't exist return
		// 3. If it does remove it from the database
		// 4. Add to another Model in DB all the purchased & sold NFTs a user has done.
		// EX: User 1 has sold 3 NFTs and bought 2.
	} catch (e) {
		console.error(e);
	}
}
