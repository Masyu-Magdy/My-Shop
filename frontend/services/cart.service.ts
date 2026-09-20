import { api } from "./api";
import { Cart, Wishlist } from "@/types";

export const cartService = {
  get: () => api.get<{ data: Cart }>("/cart").then((r) => r.data.data),
  add: (productId: string, quantity = 1) =>
    api.post<{ data: Cart }>("/cart", { productId, quantity }).then((r) => r.data.data),
  updateQuantity: (productId: string, quantity: number) =>
    api.patch<{ data: Cart }>(`/cart/${productId}`, { quantity }).then((r) => r.data.data),
  remove: (productId: string) =>
    api.delete<{ data: Cart }>(`/cart/${productId}`).then((r) => r.data.data),
};

export const wishlistService = {
  get: () => api.get<{ data: Wishlist }>("/wishlist").then((r) => r.data.data),
  add: (productId: string) =>
    api.post<{ data: Wishlist }>(`/wishlist/${productId}`).then((r) => r.data.data),
  remove: (productId: string) =>
    api.delete<{ data: Wishlist }>(`/wishlist/${productId}`).then((r) => r.data.data),
};
