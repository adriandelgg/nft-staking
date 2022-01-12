import { BigNumberish } from "ethers";
import { Listing } from "../../models/listing";

/** Event listener for when a sale has been cancelled */
export async function cancelledSale(
	nftContract: string,
	seller: string,
	tokenId: BigNumberish
) {
	try {
		await Listing.findOneAndDelete({
			nftContract,
			seller,
			tokenId: String(tokenId)
		});
	} catch (e) {
		console.error(e);
	}
}
