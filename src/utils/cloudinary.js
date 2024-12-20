import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configuration
cloudinary.config({ 
    cloud_name: 'dfceocjts', 
    api_key: '138425849428146', 
    api_secret: '4vbE_8wlkuu0cx_cEVnR7VM74C0'
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        //Upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        //File has been uploaded successfully
        console.log("File is uploaded on cloudinary", response.url);
        return response;
        
    } catch (error) {
        console.error("Error during upload:", error.message, error);
        fs.unlinkSync(localFilePath);
        return null;
    }
}

export {uploadOnCloudinary}