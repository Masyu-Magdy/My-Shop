import { Router } from "express";
import {
  validateCoupon,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "../controllers/coupon.controller";
import { protect, isAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createCouponSchema, updateCouponSchema, validateCouponSchema } from "../validators/misc.validator";

const router = Router();

router.post("/validate", protect, validate(validateCouponSchema), validateCoupon);

router.get("/", protect, isAdmin, getCoupons);
router.post("/", protect, isAdmin, validate(createCouponSchema), createCoupon);
router.patch("/:id", protect, isAdmin, validate(updateCouponSchema), updateCoupon);
router.delete("/:id", protect, isAdmin, deleteCoupon);

export default router;
