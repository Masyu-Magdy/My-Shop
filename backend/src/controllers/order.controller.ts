import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { param } from "../utils/param";
import { orderService } from "../services/order.service";
import { Order } from "../models/Order";
import { ApiError } from "../utils/ApiError";
import { streamInvoicePDF } from "../utils/generateInvoicePDF";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.createOrder(req.user!.id, req.body);
  res.status(201).json({ success: true, message: "Order created successfully", data: order });
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await orderService.getUserOrders(req.user!.id);
  res.status(200).json({ success: true, data: orders });
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getOrderById(param(req.params.id));
  res.status(200).json({ success: true, data: order });
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.cancelOrder(param(req.params.id), req.user!.id, req.user!.role === "admin");
  res.status(200).json({ success: true, message: "Order cancelled successfully", data: order });
});

export const downloadInvoice = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(param(req.params.id)).populate("user", "name email");
  if (!order) throw new ApiError(404, "Order not found");

  const isOwner = order.user._id.toString() === req.user!.id;
  if (!isOwner && req.user!.role !== "admin") {
    throw new ApiError(403, "You are not allowed to view this invoice");
  }

  streamInvoicePDF(order, (order.user as any).name, res);
});

// --- Admin ---

export const getAllOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: orders });
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.updateStatus(param(req.params.id), req.body.status);
  res.status(200).json({ success: true, message: "Order status updated", data: order });
});
