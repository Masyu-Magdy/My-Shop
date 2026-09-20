"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { IconButton } from "@mui/material";
import { Product } from "@/types";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/providers/AuthProvider";
import toast from "react-hot-toast";

export default function ProductCard({ product }: { product: Product }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const finalPrice = product.price * (1 - product.discountPercentage / 100);
  const inWishlist = isInWishlist(product._id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Sign in to save items to your wishlist");
    inWishlist ? removeFromWishlist(product._id) : addToWishlist(product._id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({ productId: product._id });
  };

  return (
    <Link
      href={`/products/${product._id}`}
      className="tilt-card group block rounded-2xl border border-gray-100 overflow-hidden bg-white"
    >
      <div className="relative aspect-square bg-gray-50">
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          className="object-cover group-hover:scale-105 transition duration-300"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {product.discountPercentage > 0 && (
          <span className="absolute top-2 left-2 bg-(--color-accent) text-white text-xs font-bold px-2 py-1 rounded-full">
            -{Math.round(product.discountPercentage)}%
          </span>
        )}
        <IconButton
          size="small"
          onClick={handleWishlistToggle}
          className="!absolute top-2 right-2 !bg-white/90"
        >
          <Heart size={16} fill={inWishlist ? "#e11d48" : "none"} color={inWishlist ? "#e11d48" : "currentColor"} />
        </IconButton>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-sm">Out of stock</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="text-xs text-gray-500">{product.brand}</p>
        <h3 className="font-semibold text-sm line-clamp-1 mt-0.5">{product.title}</h3>

        <div className="flex items-center gap-1 mt-1">
          <Star size={14} fill="#facc15" color="#facc15" />
          <span className="text-xs text-gray-600">
            {product.rating.toFixed(1)} ({product.numReviews})
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-(--color-primary)">${finalPrice.toFixed(2)}</span>
            {product.discountPercentage > 0 && (
              <span className="text-xs text-gray-400 line-through">${product.price.toFixed(2)}</span>
            )}
          </div>
          <IconButton
            size="small"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="!bg-(--color-primary) !text-white disabled:!bg-gray-300"
          >
            <ShoppingCart size={16} />
          </IconButton>
        </div>
      </div>
    </Link>
  );
}
