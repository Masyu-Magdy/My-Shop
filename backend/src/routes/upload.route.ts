import { Router } from "express";
import { uploadSingleImage, uploadMultipleImages } from "../controllers/upload.controller";
import { protect, isAdmin } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

router.use(protect, isAdmin);

router.post("/", upload.single("image"), uploadSingleImage);
router.post("/multiple", upload.array("images", 6), uploadMultipleImages);

export default router;
