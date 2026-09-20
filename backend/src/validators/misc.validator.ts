import { z } from "zod";

export const createCouponSchema = z.object({
  code: z.string().min(3, "Code is too short"),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().positive("Discount value must be greater than 0"),
  expirationDate: z.coerce.date(),
  maxUses: z.number().int().positive().optional(),
  minimumOrderAmount: z.number().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

export const updateCouponSchema = createCouponSchema.partial();

export const validateCouponSchema = z.object({
  code: z.string().min(1, "Please enter a coupon code"),
  orderAmount: z.number().nonnegative(),
});

export const addToCartSchema = z.object({
  productId: z.string().min(1, "productId is required"),
  quantity: z.number().int().positive().optional(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, "Quantity cannot be negative"),
});

export const addReviewSchema = z.object({
  rating: z.number().int().min(1, "Rating must be between 1 and 5").max(5),
  comment: z.string().min(2, "Comment is too short"),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Name is too short"),
  image: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
});
