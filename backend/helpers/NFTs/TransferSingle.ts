import { BigNumberish } from "ethers";

export async function transferSingle(
	operator: string,
	from: string,
	to: string,
	tokenId: BigNumberish,
	value: BigNumberish
) {
	// 1. Check that the traded token is an NFT
	// 2. Find owner with from & tokenId
	// 3. Remove the NFT from their array in DB
	// 4. Use to and tokenId to create a new owner.
	// 5. Find the new owner in the DB
	// 6. If it exists, add the tokenId to their array
	// 7. If not, create a new user with the NFT in there
}
