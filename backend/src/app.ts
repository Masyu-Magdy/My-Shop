import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import passport from "./config/passport";

import healthRoute from "./routes/health.route";
import authRoute from "./routes/auth.route";
import productRoute from "./routes/product.route";
import categoryRoute from "./routes/category.route";
import cartRoute from "./routes/cart.route";
import wishlistRoute from "./routes/wishlist.route";
import reviewRoute from "./routes/review.route";
import orderRoute from "./routes/order.route";
import paymentRoute from "./routes/payment.route";
import couponRoute from "./routes/coupon.route";
import adminRoute from "./routes/admin.route";
import uploadRoute from "./routes/upload.route";
import { stripeWebhook } from "./controllers/payment.controller";
import { errorHandler, notFound } from "./middleware/errorHandler";

const app: Application = express();

// --- Security & Core Middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());
app.use(morgan("dev"));
app.use(passport.initialize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);


app.post("/api/payments/webhook", express.raw({ type: "application/json" }), stripeWebhook);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.use("/api/health", healthRoute);
app.use("/api/auth", authRoute);
app.use("/api/products", productRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/cart", cartRoute);
app.use("/api/wishlist", wishlistRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/orders", orderRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/coupons", couponRoute);
app.use("/api/admin", adminRoute);
app.use("/api/upload", uploadRoute);

app.use(notFound);
app.use(errorHandler);

export default app;
