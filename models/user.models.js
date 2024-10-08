import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        userName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        avatar: {
            type: String, ///cloudnary Url store
        },
        coverImage: {
            type: String
        },
        watchHistory: [{
            type: Schema.Types.ObjectId,
            ref: "Video",
        }],
        password: {
            type: String,
            required: [true, "password is required"],
        },
        refereshToken: {
            type: String
        }
    }, { timestamps: true }
);

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        console.log("fdsfsd");
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } else {
        next();
    }
})

userSchema.methods.isPasswordCorrect = async (password) => {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = async function () {
    return jwt.sign({ _id: this._id, email: this.email, username: this.username, fullName: this.fullName }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY })
}

userSchema.methods.generateRefreshToken = async function () {
    return jwt.sign({ _id: this._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY })
}


export const User = mongoose.model('User', userSchema);