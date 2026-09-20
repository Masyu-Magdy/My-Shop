import { api } from "./api";
import { Order } from "@/types";

export interface CreateOrderPayload {
  shippingAddress: {
    fullName: string;
    phone: string;
    governorate: string;
    city: string;
    details: string;
  };
  shippingMethod: "standard" | "express";
  paymentMethod: "cod" | "stripe";
  couponCode?: string;
}

export const orderService = {
  create: (payload: CreateOrderPayload) =>
    api.post<{ data: Order }>("/orders", payload).then((r) => r.data.data),

  getMine: () => api.get<{ data: Order[] }>("/orders/my-orders").then((r) => r.data.data),

  getById: (id: string) => api.get<{ data: Order }>(`/orders/${id}`).then((r) => r.data.data),

  cancel: (id: string) => api.patch<{ data: Order }>(`/orders/${id}/cancel`).then((r) => r.data.data),

  // Downloads the invoice PDF via a blob so the browser can save it under a
  // friendly filename regardless of how the API response headers are read.
  downloadInvoice: async (id: string) => {
    const response = await api.get(`/orders/${id}/invoice`, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `invoice-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // --- Admin ---
  getAll: () => api.get<{ data: Order[] }>("/orders/all").then((r) => r.data.data),
  updateStatus: (id: string, status: string) =>
    api.patch<{ data: Order }>(`/orders/${id}/status`, { status }).then((r) => r.data.data),
};

export const paymentService = {
  createPaymentIntent: (orderId: string) =>
    api
      .post<{ data: { clientSecret: string; total: number } }>("/payments/create-payment-intent", {
        orderId,
      })
      .then((r) => r.data.data),
};

export const couponService = {
  validate: (code: string, orderAmount: number) =>
    api.post("/coupons/validate", { code, orderAmount }).then((r) => r.data.data),
};
