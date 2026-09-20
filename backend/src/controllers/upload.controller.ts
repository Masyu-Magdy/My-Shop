import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { cloudinary } from "../config/cloudinary";
import { ApiError } from "../utils/ApiError";

const streamUpload = (buffer: Buffer): Promise<string> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "ecommerce", resource_type: "image" },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });

export const uploadSingleImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new ApiError(400, "No image file was uploaded");

  const url = await streamUpload(req.file.buffer);

  res.status(200).json({ success: true, message: "Image uploaded successfully", data: { url } });
});

export const uploadMultipleImages = asyncHandler(async (req: Request, res: Response) => {
  const files = (req.files as Express.Multer.File[]) || [];
  if (files.length === 0) throw new ApiError(400, "No image files were uploaded");

  const urls = await Promise.all(files.map((file) => streamUpload(file.buffer)));

  res.status(200).json({ success: true, message: "Images uploaded successfully", data: { urls } });
});
