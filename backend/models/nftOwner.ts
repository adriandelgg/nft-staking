import mongoose from "mongoose";

export interface INFTOwner {
	owner: string;
	contract: {
		address: string;
		tokenIds: string[];
	}[];
}

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
		contract: [
			{
				address: {
					type: String,
					minlength: 42,
					maxlength: 42,
					match: /^0x/,
					required: true
				},
				tokenIds: { type: [String], required: true }
			}
		]
	})
);
