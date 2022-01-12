import { getDefaultProvider } from "@ethersproject/providers";
import { Marketplace__factory } from "../typechain-types/index";

// The provider is the connection to the blockchain
export const provider = getDefaultProvider(
	// PASTE IN YOUR HARMONY URL HERE. ONLY 1 STRING ONLY, COMMENT THE REST
	"http://localhost:8545"
	// `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`
);

// The marketplace contract to be able to listen for events
export const marketplaceContract = Marketplace__factory.connect(
	"0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // <- Update with deployed Marketplace contract here
	provider
);
