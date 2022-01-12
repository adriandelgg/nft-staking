import { BigNumberish } from "ethers";
import { NFTOwner } from "../../models/nftOwner";
import { NFTs__factory } from "../../typechain-types";
import { provider } from "../connections";

// Event listener for when a TransferBatch event happens
export async function transferBatch(
	operator: string,
	from: string,
	to: string,
	tokenIds: BigNumberish[],
	values: BigNumberish[],
	address: string
) {
	try {
		const nftContract = NFTs__factory.connect(address, provider);
		for (let i = 0; i < tokenIds.length; i++) {
			let id = tokenIds[i];

			// 1. Check that the traded tokens are NFTs
			const isNFT = await nftContract.isNFT(id);
			id = id.toString();
			if (!isNFT) {
				console.warn(`Token ID ${id} is not an NFT`);
				continue;
			}

			// 2. Find owner with from & tokenId
			// 3. Remove the NFT from their array in DB
			await NFTOwner.findOneAndUpdate(
				{
					owner: from,
					"contract.address": address,
					"contract.tokenIds": id
				},
				{ $pull: { "contract.$.tokenIds": id } }
			);

			// 4. Find the new owner in the DB
			// 5. If it exists, add the tokenId to their array
			let exists = await NFTOwner.findOneAndUpdate(
				{
					owner: to,
					"contract.address": address
				},
				{ $push: { "contract.$.tokenIds": id } }
			);

			if (exists) {
				console.log("Added token ID to existing owner's collection.");
				continue;
			}

			exists = await NFTOwner.findOne({ owner: to });

			if (!exists) {
				const nft = new NFTOwner({
					owner: to,
					contract: [{ address, tokenIds: [id] }]
				});
				await nft.save();
				console.log("New NFT Owner: " + nft);
			} else {
				// 6. If not, create a new user with the NFT in there
				// 7. Use to and tokenId to create a new owner.
				const added = await NFTOwner.findOneAndUpdate(
					{ owner: to },
					{ $push: { contract: { address, tokenIds: [id] } } }
				);
				console.log("Added new NFT Address: " + added);
			}
		}
	} catch (e) {
		console.error(e);
	}
}
