import dotenv from "dotenv";
import dbSetup from "../db/index.js";
import { app } from "./app.js";
import { asyncHandler } from "../utils/asyncHandler";
dotenv.config();



asyncHandler(await dbSetup().then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log("Connected to port", process.env.PORT)
    })
}).catch((error) => {
    console.log("Mongodb Connection Fail")
}))





