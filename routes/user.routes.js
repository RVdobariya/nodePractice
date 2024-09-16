// import express from "express"
import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
const routes = Router();
// const routes = express.Router();
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import multer from "multer";


routes.route("/register").post(upload.fields(
    [
        { name: "avatar", maxCount: 1 }
    ]
), registerUser.register)

routes.route("/login").post(registerUser.login)

routes.route("/logout").post(verifyJWT, registerUser.logout)

routes.route("/refreshToken").post(registerUser.refreshAccessToken)

routes.route("/changePassword").post(verifyJWT, registerUser.changeCurrentPassword)

routes.route("/updateDetail").patch(verifyJWT, registerUser.updateDetail)

routes.route("/updateAvatar").patch(verifyJWT, upload.single("avatar"), registerUser.updateAvatar)

routes.route("/getUserChannelProfile/:userName").get(verifyJWT, registerUser.getUserChannelProfile);

routes.route("/watchHistory").get(verifyJWT, registerUser.getWatchHistory);



export default routes;