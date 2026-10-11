import { v2 as cloudinary } from "cloudinary";
import env from "../config/env.js";

cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret
});

export function uploadImage(file, options = {}) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "image",
                ...options
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve({
                    url: result.secure_url,
                    publicId: result.public_id
                });
            }
        );

        uploadStream.end(file.buffer);
    });
}

export function deleteImage(publicId) {
    return cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true
    });
}