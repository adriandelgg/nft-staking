import Joi from "joi";
import mongoose from "mongoose";

export interface IListing {
	nftContract: string;
	seller: string;
	tokenId: string;
	price: string;
}

export function validateSale() {}

export const Listing = mongoose.model<IListing>(
	"Listings",
	new mongoose.Schema({
		nftContract: {
			type: String,
			minlength: 42,
			maxlength: 42,
			match: /^0x/,
			required: true
		},
		seller: {
			type: String,
			minlength: 42,
			maxlength: 42,
			match: /^0x/,
			required: true
		},
		tokenId: { type: String, required: true },
		price: { type: String, required: true }
	})
);
