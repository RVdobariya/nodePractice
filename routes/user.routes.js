// import express from "express"
import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
const routes = Router();
// const routes = express.Router();
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


routes.route("/register").post(upload.fields(
    [
        { name: "avatar", maxCount: 1 }
    ]
), registerUser.register)

routes.route("/login").post(verifyJWT, registerUser.login)



export default routes;