"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Button as MuiButton, TextField } from "@mui/material";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { couponService } from "@/services/order.service";

export default function CartPage() {
  const { items, subtotal, isLoading, updateQuantity, removeFromCart } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");

  const applyCoupon = useMutation({
    mutationFn: () => couponService.validate(couponCode, subtotal),
    onSuccess: (data: any) => {
      setDiscount(data.discount);
      setAppliedCode(data.code);
      toast.success("Coupon applied");
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Invalid coupon code"),
  });

  const shippingEstimate = subtotal > 0 ? 50 : 0;
  const total = Math.max(0, subtotal + shippingEstimate - discount);

  if (isLoading) return <div className="max-w-5xl mx-auto px-4 py-20 text-center">Loading...</div>;

  if (items.length === 0) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-24 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <p className="text-gray-500 mt-1">You haven&apos;t added any products yet.</p>
        <Link href="/products">
          <MuiButton variant="contained" className="!mt-6 !bg-(--color-primary) !rounded-full !px-8">
            Browse products
          </MuiButton>
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
      {/* Cart Items */}
      <div className="space-y-4">
        <h1 className="text-2xl font-bold mb-4">Shopping cart</h1>
        {items.map((item) => {
          const finalPrice = item.product.price * (1 - item.product.discountPercentage / 100);
          return (
            <div key={item.product._id} className="flex gap-4 border-b pb-4">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                <Image src={item.product.thumbnail} alt={item.product.title} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{item.product.title}</h3>
                <p className="text-(--color-primary) font-bold mt-1">${finalPrice.toFixed(2)}</p>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border rounded-full">
                    <button
                      className="p-1.5"
                      onClick={() => updateQuantity({ productId: item.product._id, quantity: item.quantity - 1 })}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      className="p-1.5"
                      onClick={() => updateQuantity({ productId: item.product._id, quantity: item.quantity + 1 })}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(item.product._id)} className="text-red-500">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Summary */}
      <aside className="border rounded-2xl p-5 h-fit sticky top-24">
        <h2 className="font-bold text-lg mb-4">Order summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Estimated shipping</span><span>${shippingEstimate.toFixed(2)}</span></div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount ({appliedCode})</span><span>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-2 border-t">
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <TextField
            size="small"
            placeholder="Coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            fullWidth
          />
          <MuiButton variant="outlined" onClick={() => applyCoupon.mutate()} disabled={!couponCode}>
            Apply
          </MuiButton>
        </div>

        <Link href="/checkout">
          <MuiButton variant="contained" fullWidth className="!mt-4 !bg-(--color-primary) !py-3 !rounded-full">
            Proceed to checkout
          </MuiButton>
        </Link>
      </aside>
    </main>
  );
}
