import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Category } from "../models/Category";
import { ApiError } from "../utils/ApiError";

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-");

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find().sort({ name: 1 });
  res.status(200).json({ success: true, data: categories });
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const slug = req.body.slug || slugify(req.body.name || "");
  const category = await Category.create({ ...req.body, slug });
  res.status(201).json({ success: true, message: "Category added successfully", data: category });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const payload = { ...req.body };
  if (payload.name && !payload.slug) payload.slug = slugify(payload.name);

  const category = await Category.findByIdAndUpdate(req.params.id, payload, { new: true });
  if (!category) throw new ApiError(404, "Category not found");
  res.status(200).json({ success: true, message: "Category updated successfully", data: category });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, "Category not found");
  res.status(200).json({ success: true, message: "Category deleted successfully" });
});
