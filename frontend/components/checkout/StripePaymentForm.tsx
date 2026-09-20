"use client";

import { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button as MuiButton } from "@mui/material";
import toast from "react-hot-toast";

export default function StripePaymentForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Stripe redirects the user back here after payment. The real confirmation happens server-side via the webhook.
        return_url: `${window.location.origin}/order/success/${orderId}`,
      },
    });

    if (error) {
      toast.error(error.message || "Payment failed");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <MuiButton
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={!stripe || loading}
        className="!bg-(--color-primary) !rounded-full !py-3"
      >
        {loading ? "Confirming payment..." : "Pay now"}
      </MuiButton>
    </form>
  );
}
