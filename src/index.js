import mongoose from "mongoose";
import dotenv from "dotenv";
import dbSetup from "../db";




dotenv.config();

// const dbSetup = async () => {
//     try {
//         const database = await mongoose.connect(process.env.DB).then(() => {
//             console.log("Connected Successful")
//         });
//     } catch (error) {
//         console.log(error);
//         process.exit();
//     }
// }

await dbSetup();



