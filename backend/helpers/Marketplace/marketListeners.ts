import { getDefaultProvider } from "@ethersproject/providers";
import { Marketplace__factory } from "../../typechain-types/index";
import { cancelledSale } from "./CancelledSale";
import { listedForSale } from "./ListedForSale";
import { purchased } from "./Purchased";

const provider = getDefaultProvider("http://localhost:8545");
// `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`

const marketplaceContract = Marketplace__factory.connect("", provider);

marketplaceContract.on("ListedForSale", listedForSale);
marketplaceContract.on("CancelledSale", cancelledSale);
marketplaceContract.on("Purchased", purchased);
