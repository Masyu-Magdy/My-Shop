"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, MenuItem } from "@mui/material";
import toast from "react-hot-toast";
import { orderService } from "@/services/order.service";
import { OrderStatus } from "@/types";

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending review",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useQuery({ queryKey: ["admin-orders"], queryFn: orderService.getAll });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => orderService.updateStatus(id, status),
    onSuccess: () => {
      toast.success("Order status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage orders</h1>

      <div className="border rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-start">Order ID</th>
              <th className="p-3 text-start">Customer</th>
              <th className="p-3 text-start">Date</th>
              <th className="p-3 text-start">Total</th>
              <th className="p-3 text-start">Payment status</th>
              <th className="p-3 text-start">Order status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">Loading...</td></tr>
            ) : (
              orders?.map((order) => (
                <tr key={order._id} className="border-t">
                  <td className="p-3 font-mono text-xs">#{order._id.slice(-6).toUpperCase()}</td>
                  <td className="p-3">{typeof order.user === "object" ? order.user.name : "—"}</td>
                  <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 font-semibold">${order.total.toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td className="p-3">
                    <Select
                      size="small"
                      value={order.orderStatus}
                      onChange={(e) => updateStatus.mutate({ id: order._id, status: e.target.value })}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <MenuItem key={value} value={value}>{label}</MenuItem>
                      ))}
                    </Select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
