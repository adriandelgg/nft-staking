import Joi from "joi";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export interface IUser {
	email: string;
	password: string;
	isAdmin: boolean;
	generateAuthToken: () => string;
}

export function validateUser(user: IUser) {
	const schema = Joi.object({
		email: Joi.string().email().required().max(40).min(5),
		password: Joi.string().required(),
		isAdmin: Joi.bool()
	});

	return schema.validate(user);
}

const userSchema = new mongoose.Schema({
	email: { type: String, unique: true, required: true, min: 5, maxlength: 40 },
	password: { type: String, required: true, min: 10, max: 1024 },
	isAdmin: { type: Boolean, default: false }
});

// Generates a JWT Token
userSchema.methods.generateAuthToken = function () {
	return jwt.sign(
		{ _id: this._id, email: this.email, isAdmin: this.isAdmin },
		process.env.JWT_SECRET || "secret"
	);
};

export const User = mongoose.model<IUser>("Users", userSchema);
