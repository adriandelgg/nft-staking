import { Contract } from "../models/contract";

export async function newNFTContract(address: string) {
	try {
		const alreadyExists = await Contract.findOne({ nft: [address] });
		if (alreadyExists) return console.warn("NFT contract already exists!");

		await Contract.findOneAndUpdate(
			{ nft: { $nin: [address] } },
			{ $push: { nft: address } }
		);
	} catch (e) {
		console.error(e);
	}
}
