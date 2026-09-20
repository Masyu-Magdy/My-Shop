import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { param } from "../utils/param";
import { Review } from "../models/Review";
import { Product } from "../models/Product";
import { ApiError } from "../utils/ApiError";

export const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await Review.find({ product: param(req.params.productId) })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: reviews });
});

export const addReview = asyncHandler(async (req: Request, res: Response) => {
  const productId = param(req.params.productId);
  const { rating, comment } = req.body;

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const alreadyReviewed = await Review.findOne({ user: req.user!.id, product: productId });
  if (alreadyReviewed) {
    throw new ApiError(409, "You have already reviewed this product");
  }

  await Review.create({ user: req.user!.id, product: productId, rating, comment });

  const stats = await Review.aggregate([
    { $match: { product: product._id } },
    { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  product.rating = stats[0]?.avgRating || 0;
  product.numReviews = stats[0]?.count || 0;
  await product.save();

  res.status(201).json({ success: true, message: "Your review has been added" });
});
