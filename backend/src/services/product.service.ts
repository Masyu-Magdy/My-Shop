import { Product } from "../models/Product";
import { ApiError } from "../utils/ApiError";

interface ProductQuery {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  rating?: string;
  inStock?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-");

export const productService = {
  getAll: async (query: ProductQuery) => {
    const filter: Record<string, any> = { isActive: true };

    if (query.search) {
      filter.$text = { $search: query.search };
    }
    if (query.category) filter.category = query.category;
    if (query.brand) filter.brand = query.brand;
    if (query.inStock === "true") filter.stock = { $gt: 0 };
    if (query.inStock === "false") filter.stock = { $lte: 0 };
    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = Number(query.minPrice);
      if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
    }
    if (query.rating) filter.rating = { $gte: Number(query.rating) };

    let sortOption: Record<string, 1 | -1> = { createdAt: -1 };
    switch (query.sort) {
      case "price_asc":
        sortOption = { price: 1 };
        break;
      case "price_desc":
        sortOption = { price: -1 };
        break;
      case "rating":
        sortOption = { rating: -1 };
        break;
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "discount":
        sortOption = { discountPercentage: -1 };
        break;
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Number(query.limit) || 12);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Product.find(filter).populate("category", "name slug").sort(sortOption).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    };
  },

  getById: async (id: string) => {
    const product = await Product.findById(id).populate("category", "name slug");
    if (!product) throw new ApiError(404, "Product not found");
    return product;
  },


  update: async (id: string, data: any) => {
    const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!product) throw new ApiError(404, "Product not found");
    return product;
  },

  remove: async (id: string) => {
    const product = await Product.findByIdAndDelete(id);
    if (!product) throw new ApiError(404, "Product not found");
    return product;
  },


    create: async (data: any) => {
    let baseSlug = slugify(data.title);
    let slug = baseSlug;

    const exists = await Product.findOne({ slug });
    if (exists) {
      slug = `${baseSlug}-${Date.now().toString().slice(-5)}`;
    }

    return Product.create({ ...data, slug });
  },
};
