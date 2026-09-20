"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, ChevronDown, ChevronUp, FileDown, RotateCcw, Ban } from "lucide-react";
import { Button as MuiButton } from "@mui/material";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { orderService } from "@/services/order.service";
import { cartService } from "@/services/cart.service";
import { OrderStatus } from "@/types";

const statusSteps: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];
const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending review",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function OrderHistoryContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useQuery({ queryKey: ["my-orders"], queryFn: orderService.getMine });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this order? This can't be undone.")) return;
    setBusyId(id);
    try {
      await orderService.cancel(id);
      toast.success("Order cancelled successfully");
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Couldn't cancel this order");
    } finally {
      setBusyId(null);
    }
  };

  const handleDownloadInvoice = async (id: string) => {
    setBusyId(id);
    try {
      await orderService.downloadInvoice(id);
    } catch {
      toast.error("Couldn't download the invoice");
    } finally {
      setBusyId(null);
    }
  };

  const handleReorder = async (order: NonNullable<typeof orders>[number]) => {
    setBusyId(order._id);
    try {
      for (const item of order.items) {
        await cartService.add(item.product, item.quantity);
      }
      toast.success("Items added to your cart");
      router.push("/cart");
    } catch {
      toast.error("Some items may no longer be available");
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) return <div className="max-w-4xl mx-auto px-4 py-20 text-center">Loading...</div>;

  if (!orders || orders.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-24 text-center">
        <Package size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold">No orders yet</h2>
        <p className="text-gray-500 mt-1">You haven&apos;t placed any orders. Start shopping now.</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">My orders</h1>

      <div className="space-y-4">
        {orders.map((order) => {
          const isOpen = expanded === order._id;
          const currentStepIndex = statusSteps.indexOf(order.orderStatus as any);
          const canCancel = !["shipped", "delivered", "cancelled"].includes(order.orderStatus);
          const isBusy = busyId === order._id;

          return (
            <div key={order._id} className="border rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : order._id)}
                className="w-full flex items-center justify-between p-4 text-start"
              >
                <div>
                  <p className="font-semibold text-sm">Order #{order._id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      order.orderStatus === "cancelled" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                    }`}
                  >
                    {statusLabels[order.orderStatus]}
                  </span>
                  <span className="font-bold">${order.total.toFixed(2)}</span>
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </button>

              {isOpen && (
                <div className="border-t p-4 space-y-4">
                  {order.orderStatus !== "cancelled" && (
                    <div className="flex items-center justify-between mb-4">
                      {statusSteps.map((step, i) => (
                        <div key={step} className="flex-1 flex flex-col items-center relative">
                          <div
                            className={`w-4 h-4 rounded-full z-10 ${
                              i <= currentStepIndex ? "bg-(--color-primary)" : "bg-gray-200"
                            }`}
                          />
                          <span className="text-[10px] mt-1 text-center">{statusLabels[step]}</span>
                          {i < statusSteps.length - 1 && (
                            <div
                              className={`absolute top-2 right-1/2 w-full h-0.5 ${
                                i < currentStepIndex ? "bg-(--color-primary)" : "bg-gray-200"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {order.items.map((item) => (
                    <div key={item.product} className="flex justify-between text-sm">
                      <span>{item.title} × {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}

                  <div className="border-t pt-2 text-sm space-y-1">
                    <div className="flex justify-between"><span>Shipping address</span><span>{order.shippingAddress?.city}, {order.shippingAddress?.governorate}</span></div>
                    <div className="flex justify-between"><span>Payment method</span><span>{order.paymentMethod === "cod" ? "Cash on delivery" : "Card (Stripe)"}</span></div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <MuiButton
                      size="small"
                      startIcon={<FileDown size={14} />}
                      disabled={isBusy}
                      onClick={() => handleDownloadInvoice(order._id)}
                      className="!text-gray-700 !border-gray-300"
                      variant="outlined"
                    >
                      Invoice
                    </MuiButton>
                    <MuiButton
                      size="small"
                      startIcon={<RotateCcw size={14} />}
                      disabled={isBusy}
                      onClick={() => handleReorder(order)}
                      className="!text-(--color-primary] !border-(--color-primary)"
                      variant="outlined"
                    >
                      Reorder
                    </MuiButton>
                    {canCancel && (
                      <MuiButton
                        size="small"
                        startIcon={<Ban size={14} />}
                        disabled={isBusy}
                        onClick={() => handleCancel(order._id)}
                        color="error"
                        variant="outlined"
                      >
                        Cancel order
                      </MuiButton>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

export default function OrderHistoryPage() {
  return (
    <ProtectedRoute>
      <OrderHistoryContent />
    </ProtectedRoute>
  );
}
