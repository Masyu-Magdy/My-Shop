import { api } from "./api";

export interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  expirationDate: string;
  maxUses: number;
  usedCount: number;
  minimumOrderAmount: number;
  isActive: boolean;
}

export const adminCouponService = {
  getAll: () => api.get<{ data: Coupon[] }>("/coupons").then((r) => r.data.data),
  create: (data: Partial<Coupon>) => api.post("/coupons", data),
  update: (id: string, data: Partial<Coupon>) => api.patch(`/coupons/${id}`, data),
  remove: (id: string) => api.delete(`/coupons/${id}`),
};
