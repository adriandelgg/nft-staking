import { BigNumberish } from "ethers";
import { NFTs__factory } from "../../typechain-types";
import { provider } from "../connections";
import { transferBatch } from "./TransferBatch";
import { transferSingle } from "./TransferSingle";

// Helps setup the NFT event listeners for NFT contracts
export function nftListener(address: string) {
	const contract = NFTs__factory.connect(address, provider);

	contract.on(
		"TransferSingle",
		(
			operator: string,
			from: string,
			to: string,
			tokenId: BigNumberish,
			value: BigNumberish
		) => transferSingle(operator, from, to, tokenId, value, address)
	);

	contract.on(
		"TransferBatch",
		(
			operator: string,
			from: string,
			to: string,
			tokenId: BigNumberish[],
			value: BigNumberish[]
		) => transferBatch(operator, from, to, tokenId, value, address)
	);
}
