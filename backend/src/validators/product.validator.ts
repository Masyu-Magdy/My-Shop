import { z } from "zod";

export const createProductSchema = z.object({
  title: z.string().min(2, "Title is too short"),
  description: z.string().min(10, "Description is too short"),
  price: z.number().nonnegative("Price must be a positive number"),
  discountPercentage: z.number().min(0).max(100).optional(),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  images: z.array(z.string().url("Each image must be a valid URL")).optional(),
  thumbnail: z.string().url("Thumbnail must be a valid URL"),
  stock: z.number().int().nonnegative("Stock must be 0 or greater"),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();
