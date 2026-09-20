"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { Button as MuiButton } from "@mui/material";
import { orderService } from "@/services/order.service";

export default function OrderSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getById(orderId),
  });

  if (isLoading) return <div className="max-w-2xl mx-auto px-4 py-24 text-center">Loading...</div>;

  return (
    <main className="max-w-2xl mx-auto px-4 py-24 text-center">
      <CheckCircle2 size={72} className="mx-auto text-green-500 mb-4" />
      <h1 className="text-2xl font-bold">Thank you! Your order has been received</h1>
      <p className="text-gray-500 mt-2">Order ID: {order?._id}</p>

      {order && (
        <div className="border rounded-2xl p-5 mt-6 text-start">
          <div className="flex justify-between text-sm mb-1"><span>Payment status</span><span className="font-semibold">{order.paymentStatus === "paid" ? "Paid" : "Pending review"}</span></div>
          <div className="flex justify-between text-sm mb-1"><span>Items</span><span>{order.items.length}</span></div>
          <div className="flex justify-between font-bold mt-2 pt-2 border-t"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
        </div>
      )}

      <div className="flex gap-3 justify-center mt-8">
        <Link href="/profile/orders">
          <MuiButton variant="outlined">View my orders</MuiButton>
        </Link>
        <Link href="/products">
          <MuiButton variant="contained" className="!bg-(--color-primary)">Continue shopping</MuiButton>
        </Link>
      </div>
    </main>
  );
}
