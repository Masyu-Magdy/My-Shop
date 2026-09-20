export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  avatar?: string;
  addresses: Address[];
  isEmailVerified?: boolean;
}

export interface Address {
  _id?: string;
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  details: string;
  isDefault: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPercentage: number;
  category: Category | string;
  brand: string;
  images: string[];
  thumbnail: string;
  stock: number;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  _id: string;
  items: CartItem[];
}

export interface Wishlist {
  _id: string;
  products: Product[];
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  product: string;
  title: string;
  thumbnail: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  user: string | User;
  items: OrderItem[];
  shippingAddress: Address;
  shippingMethod: "standard" | "express";
  paymentMethod: "cod" | "stripe";
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus: OrderStatus;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  createdAt: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}
