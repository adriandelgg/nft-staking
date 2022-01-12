require("dotenv").config();
import express from "express";
import mongoose from "mongoose";
import hpp from "hpp";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

import { marketplaceContract } from "./helpers/connections";
import { listedForSale } from "./helpers/Marketplace/ListedForSale";
import { cancelledSale } from "./helpers/Marketplace/CancelledSale";
import { purchased } from "./helpers/Marketplace/Purchased";
import { Contract } from "./models/contract";
import { nftListener } from "./helpers/NFTs/nftListener";

import login from "./routes/login";
import listings from "./routes/listings";
import contracts from "./routes/contracts";
import nftOwners from "./routes/nftOwners";
import purchases from "./routes/purchases";

const app = express();

mongoose
	.connect("mongodb://localhost:27017/justin")
	.then(() => console.log("Connected to MongoDB..."))
	.catch(err => console.error("FAILED to connect to MongoDB: " + err));

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(mongoSanitize());
app.use(hpp());

// API Routes
app.use("/api/login", login);
app.use("/api/listings", listings);
app.use("/api/contracts", contracts);
app.use("/api/nftOwners", nftOwners);
app.use("/api/purchases", purchases);

// Listens for updates on DB to properly show NFTs for sale
marketplaceContract.on("ListedForSale", listedForSale);
marketplaceContract.on("CancelledSale", cancelledSale);
marketplaceContract.on("Purchased", purchased);

// Sets up all event listeners to begin with
Contract.find()
	.select("nft -_id")
	.then(([{ nft }]) => nft.forEach(nftListener))
	.catch(console.error);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
