import multer from "multer";
import { ApiError } from "../utils/ApiError";


const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
  if (!allowed.includes(file.mimetype)) {
    cb(new ApiError(400, "Only image files (jpg, png, webp, gif, avif) are allowed") as any);
    return;
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 }, 
});
