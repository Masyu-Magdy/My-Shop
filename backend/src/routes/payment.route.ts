import { Router } from "express";
import { createPaymentIntent } from "../controllers/payment.controller";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/create-payment-intent", protect, createPaymentIntent);

export default router;
