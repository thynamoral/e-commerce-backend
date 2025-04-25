import { UploadApiResponse } from "cloudinary";
import cloudinary from "../configs/cloudinary.config";
import { PRODUCT_IMAGE_FOLDER } from "../configs/env.config";

export const uploadToCloudinary = async (
  buffer: Buffer,
  fileName: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: PRODUCT_IMAGE_FOLDER,
        public_id: fileName,
        transformation: [{ fetch_format: "auto", quality: "auto" }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!);
      }
    );
    stream.end(buffer);
  });
};
