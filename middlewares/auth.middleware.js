import jwt from "jsonwebtoken";
import { ApiResponce } from "../utils/apiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.heaher("Authoric=zation")?.replace("Bearer ", "");
        if (!token) {
            return ApiResponce(400, {
                "message": "Authentocation token is required"
            })
        }
        const decodedInfo = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedInfo?._id).select("-password -refreshToken");
        if (!user) {
            return res.status(400).json(
                ApiResponce(400, {
                    "message": "user dos not exits"
                })
            )
        }
        req.user = user;
        next();
    } catch (error) {
        console.log("error =-=-=- ", error);
        return null;
    }
})