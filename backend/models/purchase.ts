import mongoose from "mongoose";

export interface IPurchase {
	buyer: string;
	purchases: {
		nftContract: string;
		tokenId: string;
		price: string;
	}[];
}

export function validateSale() {}

export const Purchase = mongoose.model<IPurchase>(
	"Purchases",
	new mongoose.Schema({
		buyer: {
			type: String,
			minlength: 42,
			maxlength: 42,
			match: /^0x/,
			required: true
		},
		purchases: [
			{
				nftContract: {
					type: String,
					minlength: 42,
					maxlength: 42,
					match: /^0x/,
					required: true
				},
				tokenId: { type: String, required: true },
				price: { type: String, required: true }
			}
		]
	})
);
