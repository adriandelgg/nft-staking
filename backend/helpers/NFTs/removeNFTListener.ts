import { NFTs__factory } from "../../typechain-types";
import { provider } from "../contracts";

export function removeNFTListener(address: string) {
	const contract = NFTs__factory.connect(address, provider);
	contract.removeAllListeners();
}
