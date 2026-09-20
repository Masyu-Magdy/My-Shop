import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";
import { ApiError } from "../utils/ApiError";

// Builds { user: id } for logged-in requests or { guestId } for anonymous ones.
const cartOwnerFilter = (req: Request) =>
  req.user ? { user: req.user.id } : { guestId: req.guestId };

const populateOpts = "title thumbnail price discountPercentage stock";

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  let cart = await Cart.findOne(cartOwnerFilter(req)).populate("items.product", populateOpts);
  if (!cart) {
    cart = await Cart.create({ ...cartOwnerFilter(req), items: [] });
  }
  res.status(200).json({ success: true, data: cart });
});

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");
  if (product.stock < quantity) throw new ApiError(400, "Requested quantity is not available in stock");

  let cart = await Cart.findOne(cartOwnerFilter(req));
  if (!cart) {
    cart = await Cart.create({ ...cartOwnerFilter(req), items: [] });
  }

  const existingItem = cart.items.find((i) => i.product.toString() === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  await cart.populate("items.product", populateOpts);

  res.status(200).json({ success: true, message: "Added to cart", data: cart });
});

export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne(cartOwnerFilter(req));
  if (!cart) throw new ApiError(404, "Cart not found");

  const item = cart.items.find((i) => i.product.toString() === req.params.productId);
  if (!item) throw new ApiError(404, "Product not found in cart");

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  await cart.populate("items.product", populateOpts);

  res.status(200).json({ success: true, data: cart });
});

export const removeFromCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await Cart.findOne(cartOwnerFilter(req));
  if (!cart) throw new ApiError(404, "Cart not found");

  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  await cart.save();

  res.status(200).json({ success: true, message: "Product removed from cart", data: cart });
});

/**
 * Called right after a successful login/register when the request carried a guestId
 * cookie: merges the anonymous cart's items into the now-identified user's cart
 * (summing quantities for products present in both), then deletes the guest cart
 * and clears its cookie so it's never reused for a different account.
 */
export const mergeGuestCartIfAny = async (
  req: Request,
  res: Response,
  userId: string
): Promise<void> => {
  const guestId = req.cookies?.guestId;
  if (!guestId) return;

  const guestCart = await Cart.findOne({ guestId });
  if (guestCart && guestCart.items.length > 0) {
    let userCart = await Cart.findOne({ user: userId });
    if (!userCart) {
      userCart = await Cart.create({ user: userId, items: [] });
    }

    for (const guestItem of guestCart.items) {
      const existing = userCart.items.find((i) => i.product.toString() === guestItem.product.toString());
      if (existing) {
        existing.quantity += guestItem.quantity;
      } else {
        userCart.items.push({ product: guestItem.product, quantity: guestItem.quantity });
      }
    }
    await userCart.save();
  }

  if (guestCart) await guestCart.deleteOne();
  res.clearCookie("guestId");
};
