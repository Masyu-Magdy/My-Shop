import { Router } from "express";
import { getProductReviews, addReview } from "../controllers/review.controller";
import { protect } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { addReviewSchema } from "../validators/misc.validator";

const router = Router();

router.get("/:productId", getProductReviews);
router.post("/:productId", protect, validate(addReviewSchema), addReview);

export default router;
