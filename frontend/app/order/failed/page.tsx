"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button as MuiButton } from "@mui/material";

export default function OrderFailedPage() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-24 text-center">
      <XCircle size={72} className="mx-auto text-red-500 mb-4" />
      <h1 className="text-2xl font-bold">Payment failed</h1>
      <p className="text-gray-500 mt-2">Something went wrong while processing your payment. Please try again.</p>

      <div className="flex gap-3 justify-center mt-8">
        <Link href="/checkout">
          <MuiButton variant="contained" className="!bg-(--color-primary)">Try again</MuiButton>
        </Link>
        <Link href="/cart">
          <MuiButton variant="outlined">Back to cart</MuiButton>
        </Link>
      </div>
    </main>
  );
}
