require("dotenv").config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import { marketplaceContract } from "./helpers/contracts";
import { listedForSale } from "./helpers/Marketplace/ListedForSale";
import { cancelledSale } from "./helpers/Marketplace/CancelledSale";
import { purchased } from "./helpers/Marketplace/Purchased";
import { transferSingle } from "./helpers/NFTs/TransferSingle";

const account0 = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const account1 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";

const app = express();

mongoose
	.connect("mongodb://localhost:27017/justin")
	.then(() => console.log("Connected to MongoDB..."))
	.catch(err => console.error("FAILED to connect to MongoDB: " + err));

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

marketplaceContract.on("ListedForSale", listedForSale);
marketplaceContract.on("CancelledSale", cancelledSale);
marketplaceContract.on("Purchased", purchased);

transferSingle("0x0", account0, account1, 1, 1);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
