import { BigNumberish } from "ethers";
import { NFTOwner } from "../../models/nftOwner";
import { nftContract } from "../contracts";

export async function transferSingle(
	operator: string,
	from: string,
	to: string,
	tokenId: BigNumberish,
	value: BigNumberish,
	contractAddress: string
) {
	try {
		// 1. Check that the traded token is an NFT
		const isNFT = await nftContract.isNFT(tokenId);
		tokenId = String(tokenId);
		if (!isNFT) return console.warn(`Token ID ${tokenId} is not an NFT`);

		// 2. Find owner with from & tokenId
		// 3. Remove the NFT from their array in DB
		await NFTOwner.findOneAndUpdate(
			{ owner: from, tokenIds: [tokenId] },
			{ $pull: { tokenIds: tokenId } }
		);

		// 4. Find the new owner in the DB
		// const ownerExists = await NFTOwner.findOne({ owner: to });
		// if (ownerExists) {
		// 5. If it exists, add the tokenId to their array
		let ownerExists = await NFTOwner.findOneAndUpdate(
			{ owner: to, tokenIds: { $nin: [tokenId] } },
			{ $push: { tokenIds: tokenId } }
		);
		console.log("ownerExists: " + ownerExists);
		if (!ownerExists) {
			// } else {
			// 6. If not, create a new user with the NFT in there
			// 7. Use to and tokenId to create a new owner.
			ownerExists = await NFTOwner.findOne({ owner: to, tokenIds: [tokenId] });
			if (ownerExists)
				return console.warn(`Owner already has token ID ${tokenId}.`);
			const nft = new NFTOwner({ owner: to, tokenIds: [tokenId] });
			console.log("nft: " + nft);
			await nft.save();
		}
		// }
	} catch (e) {
		console.error(e);
	}
}
