// lib/utils/imageUploader.ts
import { v2 as cloudinary } from "cloudinary";

export const cloudinaryConnect = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
  });
};

export const uploadImageToCloudinary = async (file: { tempFilePath: string }, folder = "profile_pics") => {
  return cloudinary.uploader.upload(file.tempFilePath, { folder, resource_type: "auto" });
};
