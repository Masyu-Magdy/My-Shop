import { Router } from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller";
import { protect, isAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createProductSchema, updateProductSchema } from "../validators/product.validator";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", protect, isAdmin, validate(createProductSchema), createProduct);
router.patch("/:id", protect, isAdmin, validate(updateProductSchema), updateProduct);
router.delete("/:id", protect, isAdmin, deleteProduct);

export default router;
