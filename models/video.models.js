import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema(
    {
        videoFile: {
            type: String, required: true,
        },
        // thumbnail: {
        //     type: String, required: true,
        // },
        title: {
            type: String, required: true,
        },
        description: {
            type: String, required: true,
        },
        duration: {
            type: Number, required: true,
        },
        Views: {
            type: Number,
            default: 0,
        },
        Likes: {
            type: Number, default: 0
        },
        LikeUserList: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            }
        ],
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timeStamp: true
    })


videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema);
