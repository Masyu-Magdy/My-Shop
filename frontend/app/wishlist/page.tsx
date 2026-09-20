"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Button as MuiButton } from "@mui/material";
import { useWishlist } from "@/hooks/useWishlist";
import ProductCard from "@/components/products/ProductCard";

export default function WishlistPage() {
  const { products, isLoading } = useWishlist();

  if (isLoading) return <div className="max-w-6xl mx-auto px-4 py-20 text-center">Loading...</div>;

  if (products.length === 0) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-24 text-center">
        <Heart size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold">Your wishlist is empty</h2>
        <p className="text-gray-500 mt-1">Save products you love so you can find them again easily.</p>
        <Link href="/products">
          <MuiButton variant="contained" className="!mt-6 !bg-(--color-primary) !rounded-full !px-8">
            Explore products
          </MuiButton>
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Wishlist</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </main>
  );
}
