import { BigNumberish } from "ethers";
import { Listing } from "../../models/listing";

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
