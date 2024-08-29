import mongoose from "mongoose";

const dbSetup = async () => {

    async () => {
        try {
            const database = await mongoose.connect(process.env.DB).then(() => {
                console.log("Connected Successful")
            });
        } catch (error) {
            console.log(error);
            process.exit();
        }
    };

};

export default dbSetup;