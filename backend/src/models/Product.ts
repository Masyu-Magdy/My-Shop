import { Schema, model, Document, Types } from "mongoose";

export interface IProduct extends Document {
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPercentage: number;
  category: Types.ObjectId;
  brand: string;
  images: string[];
  thumbnail: string;
  stock: number;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  isActive: boolean;
}

const productSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    brand: { type: String, default: "" },
    images: { type: [String], default: [] },
    thumbnail: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text", brand: "text" });

export const Product = model<IProduct>("Product", productSchema);
