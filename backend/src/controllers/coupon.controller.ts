import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Coupon } from "../models/Coupon";
import { ApiError } from "../utils/ApiError";

export const validateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { code, orderAmount } = req.body;

  const coupon = await Coupon.findOne({ code: code?.toUpperCase(), isActive: true });
  if (!coupon) throw new ApiError(404, "Invalid coupon code");
  if (coupon.expirationDate < new Date()) throw new ApiError(400, "This coupon code has expired");
  if (coupon.usedCount >= coupon.maxUses) throw new ApiError(400, "This coupon has reached its maximum usage limit");
  if (orderAmount < coupon.minimumOrderAmount) {
    throw new ApiError(400, `The minimum order amount to use this code is $${coupon.minimumOrderAmount}`);
  }

  const discount =
    coupon.discountType === "percentage"
      ? (orderAmount * coupon.discountValue) / 100
      : coupon.discountValue;

  res.status(200).json({
    success: true,
    data: { code: coupon.code, discountType: coupon.discountType, discount },
  });
});

// --- Admin ---
export const getCoupons = asyncHandler(async (_req: Request, res: Response) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: coupons });
});

export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, message: "Coupon created successfully", data: coupon });
});

export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!coupon) throw new ApiError(404, "Coupon not found");
  res.status(200).json({ success: true, message: "Coupon updated successfully", data: coupon });
});

export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw new ApiError(404, "Coupon not found");
  res.status(200).json({ success: true, message: "Coupon deleted successfully" });
});
