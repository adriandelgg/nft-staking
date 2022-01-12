import { BigNumberish } from "ethers";
import { NFTOwner } from "../../models/nftOwner";
import { NFTs__factory } from "../../typechain-types";
import { provider } from "../connections";

export async function transferSingle(
	operator: string,
	from: string,
	to: string,
	tokenId: BigNumberish,
	value: BigNumberish,
	address: string
) {
	try {
		const nftContract = NFTs__factory.connect(address, provider);

		// 1. Check that the traded token is an NFT
		const isNFT = await nftContract.isNFT(tokenId);
		tokenId = String(tokenId);
		if (!isNFT) return console.warn(`Token ID ${tokenId} is not an NFT`);

		// 2. Find owner with from & tokenId
		// 3. Remove the NFT from their array in DB
		await NFTOwner.findOneAndUpdate(
			{
				owner: from,
				"contract.address": address,
				"contract.tokenIds": tokenId
			},
			{ $pull: { "contract.$.tokenIds": tokenId } }
		);

		// 4. Find the new owner in the DB
		// 5. If it exists, add the tokenId to their array
		let exists = await NFTOwner.findOneAndUpdate(
			{
				owner: to,
				"contract.address": address
			},
			{ $push: { "contract.$.tokenIds": tokenId } }
		);

		if (exists) {
			return console.log("Added token ID to existing owner's collection.");
		}

		exists = await NFTOwner.findOne({ owner: to });

		if (!exists) {
			const nft = new NFTOwner({
				owner: to,
				contract: [{ address, tokenIds: [tokenId] }]
			});
			await nft.save();
			console.log("New NFT Owner: " + nft);
		} else {
			// 6. If not, create a new user with the NFT in there
			// 7. Use to and tokenId to create a new owner.
			const added = await NFTOwner.findOneAndUpdate(
				{ owner: to },
				{ $push: { contract: { address, tokenIds: [tokenId] } } }
			);
			console.log("Added new NFT Address: " + added);
		}
	} catch (e) {
		console.error(e);
	}
}
