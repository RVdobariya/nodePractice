import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/apiResponce.js";


const registerUser = asyncHandler(async (req, res) => {
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
})


export { registerUser };