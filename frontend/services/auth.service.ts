import { api } from "./api";
import { User, Address } from "@/types";

export const authService = {
  register: (data: { name: string; email: string; phone?: string; password: string }) =>
    api.post<{ data: { user: User } }>("/auth/register", data).then((r) => r.data.data.user),

  login: (data: { email: string; password: string }) =>
    api.post<{ data: { user: User } }>("/auth/login", data).then((r) => r.data.data.user),

  logout: () => api.post("/auth/logout"),
  logoutAllDevices: () => api.post("/auth/logout-all"),

  getMe: () => api.get<{ data: { user: User } }>("/auth/me").then((r) => r.data.data.user),

  updateMe: (data: { name?: string; phone?: string; avatar?: string }) =>
    api.patch<{ data: { user: User } }>("/auth/me", data).then((r) => r.data.data.user),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch("/auth/change-password", data),

  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    api.post("/auth/reset-password", { token, password }),

  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),

  resendVerification: () => api.post("/auth/resend-verification"),

  // --- Addresses ---
  getAddresses: () => api.get<{ data: Address[] }>("/auth/addresses").then((r) => r.data.data),
  addAddress: (data: Omit<Address, "_id">) =>
    api.post<{ data: Address[] }>("/auth/addresses", data).then((r) => r.data.data),
  updateAddress: (id: string, data: Partial<Address>) =>
    api.patch<{ data: Address[] }>(`/auth/addresses/${id}`, data).then((r) => r.data.data),
  deleteAddress: (id: string) =>
    api.delete<{ data: Address[] }>(`/auth/addresses/${id}`).then((r) => r.data.data),

  googleLoginUrl: () => `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/google`,
};
