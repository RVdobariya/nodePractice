import mongoose from "mongoose";
import dotenv from "dotenv";
import dbSetup from "../db/index.js";
dotenv.config();



await dbSetup();



