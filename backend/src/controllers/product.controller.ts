import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { param } from "../utils/param";
import { productService } from "../services/product.service";

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const result = await productService.getAll(req.query as any);
  res.status(200).json({ success: true, ...result });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getById(param(req.params.id));
  res.status(200).json({ success: true, data: product });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.create(req.body);
  res.status(201).json({ success: true, message: "Product added successfully", data: product });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.update(param(req.params.id), req.body);
  res.status(200).json({ success: true, message: "Product updated successfully", data: product });
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  await productService.remove(param(req.params.id));
  res.status(200).json({ success: true, message: "Product deleted successfully" });
});
