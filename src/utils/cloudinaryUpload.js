

import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
cloudinary.config({
    cloud_name: "dxyeqeuhf"||process.env.CLOUDINARY_CLOUD_NAME,
    api_key:"587488989395659"|| process.env.CLOUDINARY_API_KEY,
    api_secret:"dThK-ystG29-U43CXfXL0voa1_M"|| process.env.CLOUDINARY_API_SECRET,
});



export const cloudinaryUpload = async (localpaths) => {
    console.log( process.env.CLOUDINARY_CLOUD_NAME,
         process.env.CLOUDINARY_API_KEY,
         process.env.CLOUDINARY_API_SECRET,);
    
    try {
        if (!localpaths || localpaths.length === 0) return null;

        let uploadResponses = [];

     
        const filePaths = Array.isArray(localpaths) ? localpaths : [localpaths];

        for (const filePath of filePaths) {
                const response = await cloudinary.uploader.upload(filePath, {
                resource_type: "auto",
            });

            console.log(`File uploaded successfully: ${response.url}`);
            uploadResponses.push(response);

           
            fs.unlinkSync(filePath);
        }
        console.log(uploadResponses);
        

        return uploadResponses; 
    } catch (error) {
        console.error("Error uploading files:", error);

       
        if (localpaths) {
            const filePaths = Array.isArray(localpaths) ? localpaths : [localpaths];
            for (const filePath of filePaths) {
                try {
                    fs.unlinkSync(filePath);
                } catch (unlinkError) {
                    console.error(`Error deleting file ${filePath}:`, unlinkError);
                }
            }
        }
    }
};

export const deleteFromCloudinary = async (url) => {
    try {
        await cloudinary.uploader.destroy(url);
    } catch (error) {
        console.error("Cloudinary Deletion Error:", error);
    }
};


