import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/apiResponce.js";


const registerUser = asyncHandler(async (req, res) => {
    const { email, userName, fullName, password } = req.body;
    console.log("email === ", email);
    console.log("userName === ", userName);
    console.log("fullName === ", fullName);
    console.log("password === ", password);

    if ([fullName, email, userName, password].some((f) => { f?.trim() === "" })) {
        throw new ApiError(400, "All fields are required")
    }
    // const userExists = await User.findOne({ userName });

    // console.log("password === ", userExists);
    // if (userExists) {
    // throw new ApiError(409, "This user is Already exits");
    // }

    // const avatar = req.files?.avatar[0]?.path;
    // const coverImage = req.files?.coverImage[0]?.path;
    // if (!avatar) {
    // throw new ApiError(400, "dfssfsfsd");
    // }
    // const avatarImagPath = await uploadOnCloudinary(avatar);
    // const coverImagPath = await uploadOnCloudinary(coverImage);
    // if (!avatarImagPath) {
    // throw new ApiError(400, "dfssfsfsd");
    // }

    const users = await User.create({
        fullName, userName, email, password
    });

    const findUser = await User.findById(users._id).select("-password -refereshToken");

    if (!findUser) {
        throw new ApiError(400, "error");
    }


    res.status(200).json(
        new ApiResponce(200, findUser, "success",)
    )
})


export { registerUser };