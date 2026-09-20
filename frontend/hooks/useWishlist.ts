"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { wishlistService } from "@/services/cart.service";
import { useAuth } from "@/providers/AuthProvider";

export function useWishlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const wishlistQuery = useQuery({
    queryKey: ["wishlist"],
    queryFn: wishlistService.get,
    enabled: !!user,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["wishlist"] });

  const addMutation = useMutation({
    mutationFn: (productId: string) => wishlistService.add(productId),
    onSuccess: () => {
      toast.success("Added to wishlist");
      invalidate();
    },
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => wishlistService.remove(productId),
    onSuccess: () => {
      toast.success("Removed from wishlist");
      invalidate();
    },
  });

  const products = wishlistQuery.data?.products || [];
  const isInWishlist = (productId: string) => products.some((p) => p._id === productId);

  return {
    products,
    isLoading: wishlistQuery.isLoading,
    isInWishlist,
    addToWishlist: addMutation.mutate,
    removeFromWishlist: removeMutation.mutate,
  };
}
