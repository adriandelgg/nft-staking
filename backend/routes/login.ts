import express from "express";
import bcrypt from "bcrypt";
import { User, validateUser } from "../models/user";
const router = express.Router();

/**
 * Creates a new user. Doesn't provide admin by default.
 * To get admin you must enter the DB and find the "users" collection
 * then find the one that you want to make admin and change the property
 * "isAdmin" to true
 */
router.post("/newUser", async (req, res) => {
	try {
		const { error, value } = validateUser(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		// Checks if the user already exists. Returns null if it doesn't.
		let user = await User.findOne({ email: value.email });
		if (user) return res.status(400).send("Email is already used.");

		user = new User(value);
		const salt = await bcrypt.genSalt();
		user.password = await bcrypt.hash(user.password, salt);
		user = await user.save();

		const token = user.generateAuthToken();
		res
			.header("x-auth-token", token)
			.send({ _id: user._id, email: value.email });
	} catch (e) {
		console.error(e);
		res.status(400).json(e);
	}
});

// Logs in a user & provides them a JWT
router.post("/", async (req, res) => {
	try {
		const { error, value } = validateUser(req.body);
		if (error) return res.status(400).send(error.details[0].message);

		let user = await User.findOne({ email: value.email });
		if (!user) return res.status(400).send("Invalid email or password.");

		const validPassword = await bcrypt.compare(value.password, user.password);

		if (!validPassword) {
			return res.status(400).send("Invalid email or password.");
		}

		const token = user.generateAuthToken();
		res.send(token);
	} catch (e) {
		console.error(e);
		res.status(400).json(e);
	}
});

export default router;
