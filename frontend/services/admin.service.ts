import { api } from "./api";
import { User } from "@/types";

export const adminService = {
  getDashboardStats: () =>
    api
      .get<{
        data: {
          totalUsers: number;
          totalProducts: number;
          totalOrders: number;
          totalRevenue: number;
          topProducts: { _id: string; totalSold: number }[];
          recentOrders: any[];
        };
      }>("/admin/dashboard")
      .then((r) => r.data.data),

  getUsers: () => api.get<{ data: User[] }>("/admin/users").then((r) => r.data.data),

  updateUserStatus: (id: string, isActive: boolean) =>
    api.patch(`/admin/users/${id}/status`, { isActive }),
};
