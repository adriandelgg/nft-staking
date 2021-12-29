import { NFTs__factory, Staking__factory } from "../typechain-types";
import { provider } from "./contracts";

export const removeNFTListener = (address: string) =>
	NFTs__factory.connect(address, provider).removeAllListeners();

export const removeStakingListener = (address: string) =>
	Staking__factory.connect(address, provider).removeAllListeners();
