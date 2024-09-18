import { ApiError } from "../utils/apiError.js";
import { ApiResponce } from "../utils/apiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "/Users/dreamworld/Documents/MyWork/backend/practice/models/video.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const video = {
    addVideo: asyncHandler(async (req, res) => {

        const videoFile = req.file?.path;
        const { title, description, duration, owner } = req.body;

        console.error("paths ", videoFile);

        if (!videoFile) {
            throw new ApiError(400, "Video file is required")
        }

        const videoUrl = await uploadOnCloudinary(videoFile);

        if (!videoUrl) {
            throw new ApiError(400, "Video Not uploaded Successfully")
        }

        const video = await Video({
            videoFile: videoUrl, title, description, duration, owner: req.user._id
        })

        await video.save();

        return res.status(200).json(
            new ApiResponce(200, { "videoUrl": videoUrl }, "Video uploaded Successfully")
        )

    }),

    getVideo: asyncHandler(async (req, res) => {
        const videoList = await Video.aggregate([
            {
                $match: {
                    owner: req.user?._id
                }
            },
            {
                $project: {
                    owner: 0 // Exclude the owner field
                }
            }
        ])

        if (!videoList?.length) {
            return res.status(200).json(
                new ApiResponce(200, { "videoList": videoList }, "No video found")
            )
        }

        return res.status(200).json(
            new ApiResponce(200, { "videoList": videoList }, "Video fetchSuccessfully Successfully")
        )

    })
}

export { video }