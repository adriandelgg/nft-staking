import { BigNumberish } from "ethers";

export async function transferBatch(
	operator: string,
	from: string,
	to: string,
	tokenId: BigNumberish[],
	value: BigNumberish[]
) {
	// 1. Check that the traded tokens are NFTs
}
