import { Router } from "express";
import passport from "../config/passport";
import {
  register,
  login,
  logout,
  logoutAllDevices,
  refreshAccessToken,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe,
  updateMe,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  googleAuthCallback,
} from "../controllers/auth.controller";
import { protect, identify } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { addressSchema } from "../validators/auth.validator";

const router = Router();
router.post("/register", identify, register);
router.post("/login", identify, login);
router.post("/logout", logout);
router.post("/logout-all", protect, logoutAllDevices);
router.post("/refresh", refreshAccessToken);

router.get("/verify-email", verifyEmail);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", protect, resendVerification);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", protect, getMe);
router.patch("/me", protect, updateMe);
router.patch("/change-password", protect, changePassword);

router.get("/addresses", protect, getAddresses);
router.post("/addresses", protect, validate(addressSchema), addAddress);
router.patch("/addresses/:addressId", protect, updateAddress);
router.delete("/addresses/:addressId", protect, deleteAddress);

// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }));
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  googleAuthCallback
);

export default router;
