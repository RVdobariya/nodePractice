import { ApiError } from "../utils/apiError.js";
import { ApiResponce } from "../utils/apiResponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.models.js"
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

        // const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        // const limit = parseInt(req.query.limit) || 10;
        // const skip = (page - 1) * limit;

        const videoList = await Video.aggregate([
            {
                $match: {
                    owner: req.user?._id
                }
            },

            {
                $addFields: {
                    isLikedByUser: {
                        $cond: { /// $cond means condition
                            if: {
                                $in: [req.user?._id, "$LikeUserList"]  /// $in means include
                            },
                            then: true,
                            else: false
                        }
                    },
                }
            },
            {
                $project: {
                    owner: 0,
                    LikeUserList: 0,

                    // Exclude the owner field
                }
            },
            // {
            //     $skip: skip
            // },
            // {
            //     $limit: limit
            // }
        ])

        if (!videoList?.length) {
            return res.status(200).json(
                new ApiResponce(200, { "videoList": videoList }, "No video found")
            )
        }

        const totalVideos = await Video.countDocuments({ owner: req.user?._id });

        return res.status(200).json(
            new ApiResponce(200, { "videoList": videoList, "count": totalVideos }, "Video fetch Successfully")
        )

    }),

    likeVideo: asyncHandler(async (req, res) => {
        const videoId = req.params.id;
        console.log('Video id === ', videoId)
        const video = await Video.findById(videoId);

        if (!video) {
            return res.status(404).send('Video not found');
        }

        // Check if userId already exists in LikeUserList
        const isLiked = video.LikeUserList.includes(req.user?._id);

        if (!videoId) {
            throw new ApiError(400, "Please define videoId")
        }

        let count;
        if (isLiked) {
            count = await Video.findByIdAndUpdate(
                videoId,
                {
                    $inc: { Likes: -1 },
                    $pull: { LikeUserList: req.user._id }
                },
                // $inc increments the field by 1
                { new: true } // Return the updated document
            );

            if (!count) {
                throw new ApiError(400, "Something went Wrong")
            }

            return res.status(200).json(
                new ApiResponce(200, "Success")
            )
        } else {
            count = await Video.findByIdAndUpdate(
                videoId,
                {
                    $inc: { Likes: 1 },
                    $push: { LikeUserList: req.user._id }
                },
                // $inc increments the field by 1
                { new: true } // Return the updated document
            );

            if (!count) {
                throw new ApiError(400, "Something went Wrong")
            }

            return res.status(200).json(
                new ApiResponce(200, "Success")
            )
        }
    }),
}

export { video }