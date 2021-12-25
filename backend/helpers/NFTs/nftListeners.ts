import { BigNumberish } from "ethers";
import { NFTs__factory } from "../../typechain-types";
import { provider } from "../contracts";
import { transferBatch } from "./TransferBatch";
import { transferSingle } from "./TransferSingle";

export function nftListeners(address: string) {
	const contract = NFTs__factory.connect(address, provider);
	contract.on(
		"TransferSingle",
		(
			operator: string,
			from: string,
			to: string,
			tokenId: BigNumberish,
			value: BigNumberish,
			address: string
		) => transferSingle(operator, from, to, tokenId, value, address)
	);

	contract.on(
		"TransferBatch",
		(
			operator: string,
			from: string,
			to: string,
			tokenId: BigNumberish[],
			value: BigNumberish[],
			address: string
		) => transferBatch(operator, from, to, tokenId, value, address)
	);
}
