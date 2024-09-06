import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"



// Configuration
cloudinary.config({
    cloud_name: 'dvfeppufp',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY // Click 'View API Keys' above to copy your API secret
});


const uploadOnCloudinary = async (filePath) => {
    try {
        if (!filePath) return null;
        const uploadResult = await cloudinary.uploader
            .upload(
                filePath, {
                // public_id: 'shoes',
                resource_type: 'auto'
            }).then(() => {
                console.log("Success ", uploadResult.url);
            })
            .catch((error) => {
                fs.unlinkSync(filePath);
                console.log(error);
                return null;
            });
        return uploadResult.url;
    } catch (error) {
        fs.unlinkSync(filePath);
        return null;
    }
}

export { uploadOnCloudinary }