import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/apiResponce.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


const registerUser = {
    register: asyncHandler(async (req, res) => {
        const { email, userName, fullName, password } = req.body;
        console.log("email == ", email);
        console.log("userName == ", userName);
        console.log("fullName == ", fullName);
        console.log("password == ", password);

        // console.log([fullName, email, userName, password].some((f) => f.trim() === ""));
        if ([fullName, email, userName, password].some((f) => { return f?.trim() == undefined || f.trim() === "" })) {
            return res.status(400).json(
                new ApiResponce(400, { "message": "All fields are required" }, "failed",)
            )

            // throw new ApiError(400, "All fields are required")
        }

        const avatar = req.files?.avatar == undefined ? undefined : req.files?.avatar[0]?.path;
        // const coverImage = req.files?.coverImage[0]?.path;
        if (!avatar || avatar == undefined) {
            return res.status(400).json(
                new ApiResponce(400, { "message": "Avatar image is must required" }, "failed",)
            )
        }
        const userExists = await User.findOne({
            $or: [
                { userName: userName },
                { email: email }
            ]
        })
        console.log("password === ", userExists);

        if (userExists) {
            if (userExists.userName === userName && userExists.email === email) {
                return res.status(400).json(
                    new ApiResponce(400, { "message": "Neither username nor email exists" })
                )
            }
            if (userExists.userName === userName) {
                return res.status(400).json(
                    new ApiResponce(400, { "message": "This username is Already exits" })
                )
            }
            if (userExists.email === email) {
                return res.status(400).json(
                    new ApiResponce(400, { "message": "This email is Already exits" })
                )
            }
            return res.status(400).json(
                new ApiResponce(400, { "message": "This user is Already exits" })
            )
            // throw new ApiError(409, "This user is Already exits");
        }

        const avatarImagPath = await uploadOnCloudinary(avatar);
        // const coverImagPath = await uploadOnCloudinary(coverImage);
        if (!avatarImagPath) {
            return res.status(400).json(
                new ApiError(400, "Avatar image is must required")
            )
        }
        const users = await User.create({
            fullName, userName, email, password, avatar: avatarImagPath,
        });

        const findUser = await User.findById(users._id).select("-password -refereshToken");

        if (!findUser) {
            throw new ApiError(400, "error");
        }


        return res.status(200).json(
            new ApiResponce(200, findUser, "success",)
        )
    }),

    login: asyncHandler(async (req, res) => {
        const { email, userName, password } = req.body;
        console.log("email == ", email);
        console.log("userName == ", userName);
        console.log("password == ", password);

        // console.log([fullName, email, userName, password].some((f) => f.trim() === ""));
        // if ([email, userName, password].some((f) => { return f?.trim() == undefined || f.trim() === "" })) {
        //     return res.status(400).json(
        //         new ApiResponce(400, { "message": "All fields are required" }, "failed",)
        //     )
        //     // throw new ApiError(400, "All fields are required")
        // }
        if (!(!userName || !email)) {
            return res.status(400).json(
                new ApiResponce(400, { "message": "All fields are required" }, "failed",)
            )
        }

        const user = await User.findOne({
            $or: [
                { userName },
                { email }
            ]
        })

        if (!user) {
            return res.status(400).json(
                new ApiResponce(400, { "message": "User does not exists" })
            )
            // throw new ApiError(409, "This user is Already exits");
        }
        // var correct = await user.isPasswordCorrect(password);
        var correct = await bcrypt.compare(password, user.password);
        if (!correct) {
            return res.status(400).json(
                new ApiResponce(400, { "message": "Invalid user credential" })
            )
        }

        const { accessToken, refreshToken } = await registerUser.generateAccessandRefreshToken(user?._id)
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const option = {
            httpOnly: true,
            secure: true
        }

        return res.status(200)
            .cookie("accessToken", accessToken)
            .cookie("refreshToken", refreshToken)
            .json(new ApiResponce(200, {
                user: loggedInUser, accessToken: accessToken, refreshToken: refreshToken
            }, "User loggedIn Successfully",))
    }),

    logout: asyncHandler(async (req, res) => {
        console.log("database === ", req.user)

        await User.findByIdAndUpdate(req.user._id,
            {
                $set: { refereshToken: "" }
            },
            {
                new: true
            }
        )
        const option = {
            httpOnly: true,
            secure: true
        }
        return res.status(200).clearCookie("accessToken").clearCookie("refreshToken").json({ "message": "User is Successfully logged out" })
    }),

    generateAccessandRefreshToken: async (userId) => {
        try {
            console.log("in generateAccessandRefreshToken")
            const user = await User.findById(userId);
            const accessToken = await user.generateAccessToken();
            const refreshToken = await user.generateRefreshToken();
            user.refereshToken = refreshToken;

            await user.save({ validateBeforeSave: false });

            return { accessToken, refreshToken }
        } catch (error) {
            return new ApiResponce(400, { "message": "Something" })
        }
    },

    refreshAccessToken: asyncHandler(async (req, res) => {
        console.log("roken === ", req.body.refreshToken);
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if (!incomingRefreshToken) {
            return new ApiResponce(400, {
                "message": "refresh token is required"
            }, "failed")
        }
        try {
            const data = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

            const user = await User.findById(data?._id);
            console.log("roken === ", user);
            if (!user) {
                return ApiResponce(400, {
                    "message": "invalid refreshToken"
                }, "failde")
            }

            if (incomingRefreshToken !== user?.refereshToken) {
                throw new ApiError(401, "refresh token is Expired")
            }

            const { accessToken, refreshToken } = await registerUser.generateAccessandRefreshToken(user?._id)

            const option = {
                httpOnly: true,
                secure: true
            }
            return res.status(200)
                .cookie("accessToken", accessToken, option)
                .cookie("refreshToken", refreshToken, option)
                .json(
                    new ApiResponce(200, {
                        accessToken, refreshToken
                    })
                );
        } catch (error) {
            throw new ApiError(400, error?.message, "Invalid refreshToken")
        }
    }),


    changeCurrentPassword: asyncHandler(async (req, res) => {

        const { password, newPassword } = req.body;

        console.log("pass === ", password)
        console.log("new pass === ", newPassword)
        console.log("userId === ", req.user._id)

        const user = await User.findById(req.user._id);
        console.log("userId === ", user.password)

        // const isPasswordCorrect = await user.isPasswordCorrect(password)

        const isPasswordCorrect = await bcrypt.compare(password, user.password)

        if (!isPasswordCorrect) {
            throw new ApiError(400, "Invalid Password")
        }

        user.password = newPassword;
        await user.save({ validateBeforeSave: false });

        return res.status(200).json(
            new ApiResponce(200, "password is Successfully changed")
        )

    }),

    updateDetail: asyncHandler(async (req, res, next) => {
        const { fullName, email } = req.body;

        if (!(!fullName || !email)) {
            throw new ApiError(400, "Field are required")
        }

        const user = User.findByIdAndUpdate(req.user?._id, {
            $set: {
                fullName, email: email
            }
        }, {
            new: true
        }).select("-password")

        user.save();

        return res.status(200).json(
            new ApiResponce(200, {}, "success")
        )


    }),

    updateAvatar: asyncHandler(async (req, res) => {

        const avatarFile = req.file?.path;

        if (!avatarFile) {
            throw new ApiError(400, "Avatar file is missing")
        }

        const avatar = await uploadOnCloudinary(avatarFile);
        if (!avatar.url) {
            throw new ApiError(400, "File not uploaded")
        }

        const user = await User.findByIdAndUpdate(req.user._id, {
            $set: {

            },
        }, { new: true })


    }),

    getUserChannelProfile: asyncHandler(async (req, res) => {
        const { userName } = req.params;

        if (!userName?.trim()) {
            throw new ApiError(400, "Name missing")
        }

        const channelDetail = await User.aggregate([
            {
                $match: {
                    userName: userName?.toLowerCase()
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribe"
                }
            },
            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers"
                    },
                    subscribe: { $size: "$subscribe" },
                    isSubscribed: {
                        $cond: {
                            if: {
                                $in: [req.user?._id, "$subscribers.subscriber"]
                            },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {
                    subscribersCount: 1,
                    subscribe: 1,
                    isSubscribed: 1,
                    fullName: 1,
                    userName: 1,
                    avatar: 1
                }
            }
        ])

        if (!channelDetail?.length) {
            throw new ApiError(400, "No record found")
        }

        return res.status(200).json(
            new ApiResponce(200, channelDetail[0], "data success")
        )
    })

}



export { registerUser };