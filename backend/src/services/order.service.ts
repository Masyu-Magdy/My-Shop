import { Cart } from "../models/Cart";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { Coupon } from "../models/Coupon";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { sendEmail, emailTemplates } from "../utils/email";
import { stripe } from "../config/stripe";

const SHIPPING_COSTS = { standard: 50, express: 100 };

export const orderService = {
  calculateOrderTotals: async (
    userId: string,
    shippingMethod: "standard" | "express",
    couponCode?: string
  ) => {
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, "Your cart is empty");
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product as any;
      if (!product || !product.isActive) {
        throw new ApiError(400, `The product "${product?.title || ""}" is no longer available`);
      }
      if (product.stock < item.quantity) {
        throw new ApiError(400, `The requested quantity of "${product.title}" is not available, in stock: ${product.stock}`);
      }

      const finalPrice = product.price * (1 - (product.discountPercentage || 0) / 100);
      subtotal += finalPrice * item.quantity;

      orderItems.push({
        product: product._id,
        title: product.title,
        thumbnail: product.thumbnail,
        price: Number(finalPrice.toFixed(2)),
        quantity: item.quantity,
      });
    }

    const shippingCost = SHIPPING_COSTS[shippingMethod] ?? SHIPPING_COSTS.standard;

    let discount = 0;
    let appliedCoupon: string | undefined;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && coupon.expirationDate > new Date() && coupon.usedCount < coupon.maxUses && subtotal >= coupon.minimumOrderAmount) {
        discount =
          coupon.discountType === "percentage" ? (subtotal * coupon.discountValue) / 100 : coupon.discountValue;
        appliedCoupon = coupon.code;
      }
    }

    const total = Math.max(0, subtotal + shippingCost - discount);

    return {
      items: orderItems,
      subtotal: Number(subtotal.toFixed(2)),
      shippingCost,
      discount: Number(discount.toFixed(2)),
      total: Number(total.toFixed(2)),
      couponCode: appliedCoupon,
    };
  },

  createOrder: async (userId: string, payload: any) => {
    const totals = await orderService.calculateOrderTotals(
      userId,
      payload.shippingMethod,
      payload.couponCode
    );

    const order = await Order.create({
      user: userId,
      items: totals.items,
      shippingAddress: payload.shippingAddress,
      shippingMethod: payload.shippingMethod,
      paymentMethod: payload.paymentMethod,
      paymentStatus: payload.paymentMethod === "cod" ? "pending" : "pending",
      subtotal: totals.subtotal,
      shippingCost: totals.shippingCost,
      discount: totals.discount,
      total: totals.total,
      couponCode: totals.couponCode,
    });

    const user = await User.findById(userId);
    if (user) {
      const alreadySaved = user.addresses.some(
        (a) => a.details === payload.shippingAddress.details && a.phone === payload.shippingAddress.phone
      );
      if (!alreadySaved) {
        user.addresses.push({ ...payload.shippingAddress, isDefault: user.addresses.length === 0 });
        await user.save();
      }
    }

    if (payload.paymentMethod === "cod") {
      await orderService.finalizeOrder(order.id, userId);
    }

    return order;
  },

  finalizeOrder: async (orderId: string, userId: string) => {
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }
    await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    if (order.couponCode) {
      await Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } });
    }

    order.orderStatus = "confirmed";
    await order.save();

    const user = await User.findById(userId);
    if (user) {
      sendEmail({
        to: user.email,
        subject: "Your order has been confirmed",
        html: emailTemplates.orderConfirmation(user.name, order.id, order.total, order.items.length),
      }).catch((err) => console.error("Failed to send order confirmation email:", err));
    }

    return order;
  },

  getUserOrders: async (userId: string) => Order.find({ user: userId }).sort({ createdAt: -1 }),

  getOrderById: async (id: string) => {
    const order = await Order.findById(id).populate("user", "name email");
    if (!order) throw new ApiError(404, "Order not found");
    return order;
  },

  updateStatus: async (id: string, status: string) => {
    const order = await Order.findByIdAndUpdate(id, { orderStatus: status }, { new: true });
    if (!order) throw new ApiError(404, "Order not found");
    return order;
  },


  cancelOrder: async (id: string, userId: string, isAdmin: boolean) => {
    const order = await Order.findById(id);
    if (!order) throw new ApiError(404, "Order not found");
    if (!isAdmin && order.user.toString() !== userId) {
      throw new ApiError(403, "You are not allowed to cancel this order");
    }
    if (["shipped", "delivered", "cancelled"].includes(order.orderStatus)) {
      throw new ApiError(400, `This order can no longer be cancelled (current status: ${order.orderStatus})`);
    }

    const stockWasDeducted = order.orderStatus !== "pending";
    if (stockWasDeducted) {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    }

    if (order.paymentStatus === "paid" && order.stripePaymentIntentId) {
      try {
        await stripe.refunds.create({ payment_intent: order.stripePaymentIntentId });
        order.paymentStatus = "failed";
      } catch (err) {
        console.error("Stripe refund failed for order", order.id, err);
      }
    }

    order.orderStatus = "cancelled";
    await order.save();
    return order;
  },
};
