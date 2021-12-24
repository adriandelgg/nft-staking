require("dotenv").config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import { marketplaceContract } from "./helpers/contracts";
import { listedForSale } from "./helpers/Marketplace/ListedForSale";
import { cancelledSale } from "./helpers/Marketplace/CancelledSale";
import { purchased } from "./helpers/Marketplace/Purchased";

const app = express();

mongoose
	.connect(
		"mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false"
	)
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

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
