import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { authService } from "../services/auth.service";
import { User } from "../models/User";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  sendAuthCookies,
  clearAuthCookies,
} from "../utils/generateToken";
import { ApiError } from "../utils/ApiError";
import { mergeGuestCartIfAny } from "./cart.controller";

const sanitizeUser = (user: any) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  avatar: user.avatar,
  addresses: user.addresses,
  isEmailVerified: user.isEmailVerified,
});

const issueSession = async (res: Response, user: any) => {
  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id, user.tokenVersion);
  sendAuthCookies(res, accessToken, refreshToken);
  return accessToken;
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(422, parsed.error.errors[0].message);
  }

  const user = await authService.register(parsed.data);
  const token = await issueSession(res, user);
  await mergeGuestCartIfAny(req, res, user.id);

  res.status(201).json({
    success: true,
    message: "Account created successfully. Please check your email to verify your account.",
    data: { user: sanitizeUser(user), token },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(422, parsed.error.errors[0].message);
  }

  const { email, password } = parsed.data;
  const user = await authService.login(email, password);
  const token = await issueSession(res, user);
  await mergeGuestCartIfAny(req, res, user.id);

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    data: { user: sanitizeUser(user), token },
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  clearAuthCookies(res);
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

export const logoutAllDevices = asyncHandler(async (req: Request, res: Response) => {
  await User.findByIdAndUpdate(req.user!.id, { $inc: { tokenVersion: 1 } });
  clearAuthCookies(res);
  res.status(200).json({ success: true, message: "Logged out on all devices" });
});


export const refreshAccessToken = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) throw new ApiError(401, "No refresh token provided");

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Refresh token is invalid or has expired");
  }

  const user = await User.findById(payload.id);
  if (!user || !user.isActive || user.tokenVersion !== payload.tokenVersion) {
    throw new ApiError(401, "Refresh token is no longer valid, please log in again");
  }

  const accessToken = await issueSession(res, user);
  res.status(200).json({ success: true, data: { token: accessToken } });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const token = String(req.query.token || req.body.token || "");
  if (!token) throw new ApiError(400, "Verification token is required");

  const user = await authService.verifyEmail(token);
  res.status(200).json({ success: true, message: "Email verified successfully", data: { user: sanitizeUser(user) } });
});

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  await authService.resendVerificationEmail(req.user!.id);
  res.status(200).json({ success: true, message: "Verification email sent" });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const parsed = forgotPasswordSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(422, parsed.error.errors[0].message);

  await authService.forgotPassword(parsed.data.email);

  res.status(200).json({
    success: true,
    message: "If an account exists for this email, a password reset link has been sent",
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) throw new ApiError(422, parsed.error.errors[0].message);

  await authService.resetPassword(parsed.data.token, parsed.data.password);
  res.status(200).json({ success: true, message: "Password reset successfully, please log in" });
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: { user: sanitizeUser(req.user) } });
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, avatar } = req.body;
  const user = req.user!;

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (avatar) user.avatar = avatar;
  await user.save();

  res.status(200).json({ success: true, message: "Your profile has been updated", data: { user: sanitizeUser(user) } });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user!.id).select("+password");
  if (!user) throw new ApiError(404, "User not found");

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new ApiError(401, "Current password is incorrect");

  user.password = newPassword;
  user.tokenVersion += 1; 
  await user.save();

  const token = await issueSession(res, user);
  res.status(200).json({ success: true, message: "Password changed successfully", data: { token } });
});

// --- Addresses ---

export const getAddresses = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: req.user!.addresses });
});

export const addAddress = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const isFirst = user.addresses.length === 0;
  user.addresses.push({ ...req.body, isDefault: req.body.isDefault ?? isFirst });

  if (req.body.isDefault) {
    user.addresses.forEach((a, idx) => {
      if (idx !== user.addresses.length - 1) a.isDefault = false;
    });
  }

  await user.save();
  res.status(201).json({ success: true, message: "Address added successfully", data: user.addresses });
});

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const address = user.addresses.find((a: any) => a._id?.toString() === req.params.addressId);
  if (!address) throw new ApiError(404, "Address not found");

  Object.assign(address, req.body);

  if (req.body.isDefault) {
    user.addresses.forEach((a: any) => {
      a.isDefault = a._id?.toString() === req.params.addressId;
    });
  }

  await user.save();
  res.status(200).json({ success: true, message: "Address updated successfully", data: user.addresses });
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user!;
  const existed = user.addresses.some((a: any) => a._id?.toString() === req.params.addressId);
  if (!existed) throw new ApiError(404, "Address not found");

  user.addresses = user.addresses.filter((a: any) => a._id?.toString() !== req.params.addressId) as any;

  if (user.addresses.length > 0 && !user.addresses.some((a) => a.isDefault)) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  res.status(200).json({ success: true, message: "Address deleted successfully", data: user.addresses });
});

// --- Google OAuth ---

export const googleAuthCallback = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user as any;
  if (!user) {
    return res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
  }
  await issueSession(res, user);
  res.redirect(`${process.env.CLIENT_URL}/`);
});
