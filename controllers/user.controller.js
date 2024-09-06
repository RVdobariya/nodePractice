import { asyncHandler } from "../utils/asyncHandler.js";


const registerUser = asyncHandler(async (req, res) => {
    console.log("hello")
    res.status(200).json({ "message": "ok", "g": "g" })
})


export { registerUser };