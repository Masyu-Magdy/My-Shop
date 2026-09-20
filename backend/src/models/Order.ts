import { Schema, model, Document, Types } from "mongoose";
import { IAddress } from "./User";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface IOrderItem {
  product: Types.ObjectId;
  title: string;
  thumbnail: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  id: string;
  user: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IAddress;
  shippingMethod: "standard" | "express";
  paymentMethod: "cod" | "stripe";
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: OrderStatus;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  couponCode?: string;
  stripePaymentIntentId?: string;
  createdAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    title: { type: String, required: true },
    thumbnail: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: {
      fullName: String,
      phone: String,
      governorate: String,
      city: String,
      details: String,
    },
    shippingMethod: { type: String, enum: ["standard", "express"], default: "standard" },
    paymentMethod: { type: String, enum: ["cod", "stripe"], required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: { type: String },
    stripePaymentIntentId: { type: String },
  },
  { timestamps: true }
);

export const Order = model<IOrder>("Order", orderSchema);
