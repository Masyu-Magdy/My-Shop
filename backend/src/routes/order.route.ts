import { Router } from "express";
import {
  createOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  downloadInvoice,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller";
import { protect, isAdmin } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createOrderSchema, updateOrderStatusSchema } from "../validators/order.validator";

const router = Router();

router.use(protect);

router.post("/", validate(createOrderSchema), createOrder);
router.get("/my-orders", getMyOrders);
router.get("/all", isAdmin, getAllOrders);
router.patch("/:id/status", isAdmin, validate(updateOrderStatusSchema), updateOrderStatus);
router.patch("/:id/cancel", cancelOrder);
router.get("/:id/invoice", downloadInvoice);
router.get("/:id", getOrder);

export default router;
