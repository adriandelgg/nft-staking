import { BigNumberish } from "ethers";
import { Listing } from "../../models/listing";

export async function cancelledSale(
	nftContract: string,
	seller: string,
	tokenId: BigNumberish
) {
	tokenId = String(tokenId);
	try {
		// 1. Find the token ID and NFT contract in the DB
		await Listing.findOneAndDelete({ nftContract, tokenId });
		// 2. If it doesn't exist return
		// 3. If it exists, remove it from the DB
	} catch (e) {
		console.error(e);
	}
}
