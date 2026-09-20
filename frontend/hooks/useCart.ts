"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { cartService } from "@/services/cart.service";

export function useCart() {
  const queryClient = useQueryClient();

  // Works for both logged-in users and guests - the backend identifies the
  // cart via the auth cookie or a guestId cookie, so this is always enabled.
  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: cartService.get,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["cart"] });

  const addMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity?: number }) =>
      cartService.add(productId, quantity),
    onSuccess: () => {
      toast.success("Added to cart");
      invalidate();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Something went wrong"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartService.updateQuantity(productId, quantity),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => cartService.remove(productId),
    onSuccess: () => {
      toast.success("Removed from cart");
      invalidate();
    },
  });

  const items = cartQuery.data?.items || [];
  const itemsCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => {
    const price = i.product.price * (1 - i.product.discountPercentage / 100);
    return sum + price * i.quantity;
  }, 0);

  return {
    cart: cartQuery.data,
    items,
    itemsCount,
    subtotal,
    isLoading: cartQuery.isLoading,
    addToCart: addMutation.mutate,
    updateQuantity: updateMutation.mutate,
    removeFromCart: removeMutation.mutate,
  };
}
