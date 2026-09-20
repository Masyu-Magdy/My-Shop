"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Tabs,
  Tab,
  Rating,
  TextField,
  Button as MuiButton,
} from "@mui/material";
import { Heart, Minus, Plus, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";
import { productService } from "@/services/product.service";
import { api } from "@/services/api";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/providers/AuthProvider";
import ProductCard from "@/components/products/ProductCard";

export default function ProductDetailClient({ id }: { id: string }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const queryClient = useQueryClient();

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState(0);
  const [reviewRating, setReviewRating] = useState<number | null>(5);
  const [reviewComment, setReviewComment] = useState("");

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getById(id),
  });

  const { data: related } = useQuery({
    queryKey: ["products", "related", product?.category],
    queryFn: () =>
      productService.getAll({
        category:
          typeof product?.category === "string"
            ? product.category
            : product?.category._id,
        limit: 4,
      }),
    enabled: !!product,
  });

  const { data: reviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => api.get(`/reviews/${id}`).then((r) => r.data.data),
  });

  const submitReview = useMutation({
    mutationFn: () =>
      api.post(`/reviews/${id}`, {
        rating: reviewRating,
        comment: reviewComment,
      }),
    onSuccess: () => {
      toast.success("Your review has been added");
      setReviewComment("");
      queryClient.invalidateQueries({ queryKey: ["reviews", id] });
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Something went wrong"),
  });

  if (isLoading)
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">Loading...</div>
    );
  if (!product)
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        Product not found
      </div>
    );

  const finalPrice = product.price * (1 - product.discountPercentage / 100);
  const inWishlist = isInWishlist(product._id);

  const handleAddToCart = () => {
    addToCart({ productId: product._id, quantity });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link href="/">Home</Link>
        <ChevronLeft size={14} className="rotate-180" />
        <Link href="/products">Products</Link>
        <ChevronLeft size={14} className="rotate-180" />
        <span className="text-gray-800">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50">
            <Image
              src={product.images[activeImage] || product.thumbnail}
              alt={product.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex gap-2 mt-3">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 ${
                  activeImage === i
                    ? "border-(--color-primary)"
                    : "border-transparent"
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="md:mt-24">
          <p className="text-sm text-gray-500">{product.brand}</p>
          <h1 className="text-2xl font-bold mt-1">{product.title}</h1>

          <div className="flex items-center gap-2 mt-2">
            <Rating
              value={product.rating}
              precision={0.1}
              readOnly
              size="small"
            />
            <span className="text-sm text-gray-500">
              ({product.numReviews} reviews)
            </span>
          </div>

          <div className="flex items-baseline gap-3 mt-4">
            <span className="text-3xl font-bold text-(--color-primary)">
              ${finalPrice.toFixed(2)}
            </span>
            {product.discountPercentage > 0 && (
              <>
                <span className="text-gray-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-sm bg-(--color-accent) text-white px-2 py-0.5 rounded-full font-bold">
                  -{Math.round(product.discountPercentage)}%
                </span>
              </>
            )}
          </div>

          <p
            className={`mt-2 text-sm font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}
          >
            {product.stock > 0
              ? `In stock (${product.stock} available)`
              : "Out of stock"}
          </p>

          {/* Quantity Selector */}
          <div className="flex items-center gap-3 mt-6">
            <div className="flex items-center border rounded-full">
              <button
                className="p-2"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center">{quantity}</span>
              <button
                className="p-2"
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock, q + 1))
                }
              >
                <Plus size={16} />
              </button>
            </div>

            <MuiButton
              variant="contained"
              size="large"
              disabled={product.stock === 0}
              onClick={handleAddToCart}
              className="!bg-(--color-primary) !rounded-full !px-8"
            >
              Add to cart
            </MuiButton>

            <button
              onClick={() => {
                if (!user)
                  return toast.error("Sign in to save items to your wishlist");
                inWishlist
                  ? removeFromWishlist(product._id)
                  : addToWishlist(product._id);
              }}
              className="p-3 rounded-full border"
            >
              <Heart
                size={20}
                fill={inWishlist ? "#e11d48" : "none"}
                color={inWishlist ? "#e11d48" : "currentColor"}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs: Description / Reviews */}
      <div className="mt-12">
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Description" />
          <Tab label={`Reviews (${reviews?.length || 0})`} />
        </Tabs>

        <div className="py-6">
          {tab === 0 && (
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          )}

          {tab === 1 && (
            <div className="space-y-6 max-w-xl">
              {user && (
                <div className="border rounded-2xl p-4">
                  <h4 className="font-semibold mb-2">Write a review</h4>
                  <Rating
                    value={reviewRating}
                    onChange={(_, v) => setReviewRating(v)}
                  />
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Share your thoughts on this product..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="mt-2"
                  />
                  <MuiButton
                    className="!mt-2 !bg-(--color-primary)"
                    variant="contained"
                    onClick={() => submitReview.mutate()}
                    disabled={!reviewComment}
                  >
                    Submit review
                  </MuiButton>
                </div>
              )}

              {reviews?.length === 0 && (
                <p className="text-gray-500">
                  No reviews yet. Be the first to review it!
                </p>
              )}

              {reviews?.map((r: any) => (
                <div key={r._id} className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{r.user?.name}</span>
                    <Rating value={r.rating} readOnly size="small" />
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related?.items && related.items.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">Related products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.items
              .filter((p) => p._id !== product._id)
              .map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
          </div>
        </section>
      )}
    </main>
  );
}
