import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Wishlist } from "../models/Wishlist";
import { ApiError } from "../utils/ApiError";

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  let wishlist = await Wishlist.findOne({ user: req.user!.id }).populate(
    "products",
    "title thumbnail price discountPercentage stock rating"
  );
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user!.id, products: [] });
  }
  res.status(200).json({ success: true, data: wishlist });
});

export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;

  let wishlist = await Wishlist.findOne({ user: req.user!.id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user!.id, products: [] });
  }

  if (!wishlist.products.some((p) => p.toString() === productId)) {
    wishlist.products.push(productId as any);
    await wishlist.save();
  }

  await wishlist.populate("products", "title thumbnail price discountPercentage stock rating");
  res.status(200).json({ success: true, message: "Added to wishlist", data: wishlist });
});

export const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
  const wishlist = await Wishlist.findOne({ user: req.user!.id });
  if (!wishlist) throw new ApiError(404, "Wishlist not found");

  wishlist.products = wishlist.products.filter((p) => p.toString() !== req.params.productId);
  await wishlist.save();

  res.status(200).json({ success: true, message: "Removed from wishlist", data: wishlist });
});
