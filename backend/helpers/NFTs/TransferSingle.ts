import { BigNumberish } from "ethers";
import { NFTOwner } from "../../models/nftOwner";
import { nftContract } from "../contracts";

export async function transferSingle(
	operator: string,
	from: string,
	to: string,
	tokenId: BigNumberish,
	value: BigNumberish
) {
	try {
		// 1. Check that the traded token is an NFT
		const isNFT = await nftContract.isNFT(tokenId);
		if (!isNFT) return console.warn("Token ID is not an NFT");

		tokenId = String(tokenId);
		// 2. Find owner with from & tokenId
		// 3. Remove the NFT from their array in DB
		// await NFTOwner.findOneAndUpdate()

		// 4. Find the new owner in the DB
		let owner = await NFTOwner.findOne({ owner: to });
		if (owner) {
			// 5. If it exists, add the tokenId to their array
		} else {
			// 6. If not, create a new user with the NFT in there
			// 7. Use to and tokenId to create a new owner.
			const nft = new NFTOwner({ owner: to, tokenId: [tokenId] });
		}
	} catch (e) {
		console.error(e);
	}
}
