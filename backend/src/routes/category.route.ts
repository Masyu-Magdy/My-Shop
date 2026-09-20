import { Router } from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller";
import { protect, isAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { categorySchema } from "../validators/misc.validator";

const router = Router();

router.get("/", getCategories);
router.post("/", protect, isAdmin, validate(categorySchema), createCategory);
router.patch("/:id", protect, isAdmin, updateCategory);
router.delete("/:id", protect, isAdmin, deleteCategory);

export default router;
