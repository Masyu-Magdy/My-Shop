import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { stripe } from "../config/stripe";
import { orderService } from "../services/order.service";
import { Order } from "../models/Order";
import { ApiError } from "../utils/ApiError";


export const createPaymentIntent = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.body;

  const order = await Order.findOne({ _id: orderId, user: req.user!.id });
  if (!order) throw new ApiError(404, "Order not found");
  if (order.paymentStatus === "paid") throw new ApiError(400, "This order has already been paid");

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.total * 100), 
    currency: "usd",
    metadata: { userId: req.user!.id, orderId: order.id },
  });

  order.stripePaymentIntentId = paymentIntent.id;
  await order.save();

  res.status(200).json({
    success: true,
    data: {
      clientSecret: paymentIntent.client_secret,
      total: order.total,
    },
  });
});


export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
  } catch (err: any) {
    throw new ApiError(400, `Webhook signature verification failed: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as any;
    const order = await Order.findOne({ stripePaymentIntentId: paymentIntent.id });
    if (order) {
      order.paymentStatus = "paid";
      await order.save();
      await orderService.finalizeOrder(order.id, order.user.toString());
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as any;
    await Order.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntent.id },
      { paymentStatus: "failed" }
    );
  }

  res.status(200).json({ received: true });
});
