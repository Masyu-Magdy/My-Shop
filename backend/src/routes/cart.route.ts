import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
} from "../controllers/cart.controller";
import { identify } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { addToCartSchema, updateCartItemSchema } from "../validators/misc.validator";

const router = Router();

router.use(identify);

router.get("/", getCart);
router.post("/", validate(addToCartSchema), addToCart);
router.patch("/:productId", validate(updateCartItemSchema), updateCartItem);
router.delete("/:productId", removeFromCart);

export default router;
