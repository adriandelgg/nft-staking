require("dotenv").config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";

const app = express();

mongoose
	.connect("")
	.then(() => console.log("Connected to MongoDB..."))
	.catch(err => console.error("FAILED to connect to MongoDB: " + err));
