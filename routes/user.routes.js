// import express from "express"
import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
const routes = Router();
// const routes = express.Router();


routes.route("/register").post(registerUser)



export default routes;