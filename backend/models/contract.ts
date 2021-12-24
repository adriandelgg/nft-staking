import mongoose from "mongoose";

export interface IContracts {
	nft: string[];
	staking: string[];
}

export const Contract = mongoose.model<IContracts>(
	"Contracts",
	new mongoose.Schema({
		nft: {
			type: [String],
			minlength: 42,
			maxlength: 42,
			match: /^0x/,
			required: true
		},
		staking: {
			type: [String],
			minlength: 42,
			maxlength: 42,
			match: /^0x/,
			required: true
		}
	})
);
