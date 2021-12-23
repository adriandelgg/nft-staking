import Joi from "joi";
import mongoose from "mongoose";

export interface INFTOwner {
	owner: string;
	tokenIds: number[];
}

export function validateNFT() {}

export const NFTOwner = mongoose.model<INFTOwner>(
	"NFTOwners",
	new mongoose.Schema({
		owner: {
			type: String,
			minlength: 42,
			maxlength: 42,
			match: /^0x/,
			required: true
		},
		tokenIds: { type: [Number], required: true }
	})
);
