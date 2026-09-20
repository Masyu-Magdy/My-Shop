import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { User } from "../models/User";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { ApiError } from "../utils/ApiError";

export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalUsers, totalProducts, totalOrders, revenueResult, topProducts, recentOrders] =
    await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.title", totalSold: { $sum: "$items.quantity" } } },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),
      Order.find().populate("user", "name email").sort({ createdAt: -1 }).limit(5),
    ]);

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: revenueResult[0]?.total || 0,
      topProducts,
      recentOrders,
    },
  });
});

export const getUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: users });
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true }).select("-password");
  if (!user) throw new ApiError(404, "User not found");
  res.status(200).json({
    success: true,
    message: isActive ? "Account activated" : "Account suspended",
    data: user,
  });
});
