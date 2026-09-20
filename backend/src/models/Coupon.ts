import { Schema, model, Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  expirationDate: Date;
  maxUses: number;
  usedCount: number;
  minimumOrderAmount: number;
  isActive: boolean;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    expirationDate: { type: Date, required: true },
    maxUses: { type: Number, required: true, default: 100 },
    usedCount: { type: Number, default: 0 },
    minimumOrderAmount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Coupon = model<ICoupon>("Coupon", couponSchema);
