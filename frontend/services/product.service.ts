import { api } from "./api";
import { Product, PaginationInfo } from "@/types";

export interface ProductsQuery {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export const productService = {
  getAll: (query: ProductsQuery = {}) =>
    api
      .get<{ items: Product[]; pagination: PaginationInfo }>("/products", { params: query })
      .then((r) => r.data),

  getById: (id: string) => api.get<{ data: Product }>(`/products/${id}`).then((r) => r.data.data),

  create: (data: Partial<Product>) =>
    api.post<{ data: Product }>("/products", data).then((r) => r.data.data),

  update: (id: string, data: Partial<Product>) =>
    api.patch<{ data: Product }>(`/products/${id}`, data).then((r) => r.data.data),

  remove: (id: string) => api.delete(`/products/${id}`),
};

export const categoryService = {
  getAll: () => api.get<{ data: { _id: string; name: string; slug: string }[] }>("/categories").then((r) => r.data.data),
  create: (data: { name: string; slug: string }) => api.post("/categories", data),
  update: (id: string, data: any) => api.patch(`/categories/${id}`, data),
  remove: (id: string) => api.delete(`/categories/${id}`),
};
