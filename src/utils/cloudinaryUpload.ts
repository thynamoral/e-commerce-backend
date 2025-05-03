import { UploadApiResponse } from "cloudinary";
import cloudinary from "../configs/cloudinary.config";
import { PRODUCT_IMAGE_FOLDER } from "../configs/env.config";
import { assertAppError } from "./assertAppError";
import { INTERNAL_SERVER_ERROR } from "./httpStatus";

export const uploadToCloudinary = async (
  buffer: Buffer,
  fileName: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: PRODUCT_IMAGE_FOLDER,
        public_id: fileName,
        transformation: [
          {
            width: 1000,
            height: 1000,
            crop: "fill",
            gravity: "auto",
            fetch_format: "auto",
            quality: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!);
      }
    );
    stream.end(buffer);
  });
};

export const generateUniqueFileName = (fileName: string): string => {
  const fileNameWithoutExtension = fileName.split(".").slice(0, -1).join(".");
  return `${fileNameWithoutExtension}-${Date.now()}`;
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    assertAppError(
      false,
      "Failed to delete image from cloudinary",
      INTERNAL_SERVER_ERROR
    );
  }
};
