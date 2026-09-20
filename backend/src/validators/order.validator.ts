import { z } from "zod";

const shippingAddressSchema = z.object({
  fullName: z.string().min(2, "Full name is too short"),
  phone: z.string().min(8, "Invalid phone number"),
  governorate: z.string().min(2, "Governorate is required"),
  city: z.string().min(2, "City is required"),
  details: z.string().min(3, "Address details are required"),
});

export const createOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  shippingMethod: z.enum(["standard", "express"]),
  paymentMethod: z.enum(["cod", "stripe"]),
  couponCode: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
});
