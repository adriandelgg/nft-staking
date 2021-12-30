import { BigNumberish } from "ethers";
import { Listing } from "../../models/listing";

export async function purchased(
	nftContract: string,
	seller: string,
	buyer: string,
	tokenId: BigNumberish,
	price: BigNumberish
) {
	try {
		// Converts them to strings due to the possibility of being over JS's MAX_SAFE_INT
		await Listing.findOneAndDelete({
			nftContract,
			seller,
			tokenId: String(tokenId)
		});
	} catch (e) {
		console.error(e);
	}
}
