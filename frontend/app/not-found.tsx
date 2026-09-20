"use client";

import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { Button as MuiButton } from "@mui/material";

export default function NotFound() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-40 text-center">
      <PackageSearch size={72} className="mx-auto text-gray-300 mb-4" />
      <h1 className="text-3xl font-extrabold">404</h1>
      <p className="text-lg font-semibold mt-1">We couldn't find the page you're looking for</p>
      <p className="text-gray-500 mt-2">The link might be broken, or the page may have been removed.</p>

      <div className="flex gap-3 justify-center mt-8">
        <Link href="/">
          <MuiButton variant="contained" className="!bg-(--color-primary) !rounded-full !px-6">
            Back to home
          </MuiButton>
        </Link>
        <Link href="/products">
          <MuiButton variant="outlined" className="!rounded-full !px-6">
            Browse products
          </MuiButton>
        </Link>
      </div>
    </main>
  );
}
