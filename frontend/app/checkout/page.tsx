"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Stepper,
  Step,
  StepLabel,
  TextField,
  Button as MuiButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
} from "@mui/material";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import { orderService, paymentService } from "@/services/order.service";
import StripePaymentForm from "@/components/checkout/StripePaymentForm";
import { useAuth } from "@/providers/AuthProvider";
import { Address } from "@/types";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
);

const steps = [
  "Shipping address",
  "Shipping method",
  "Payment method",
  "Review order",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, subtotal } = useCart();
  const [activeStep, setActiveStep] = useState(0);

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    governorate: "",
    city: "",
    details: "",
  });
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">(
    "standard",
  );
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "stripe">("cod");

  const [orderId, setOrderId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  const shippingCost = shippingMethod === "express" ? 100 : 50;
  const total = subtotal + shippingCost;

  const isAddressValid = Object.values(address).every((v) => v.trim() !== "");

  const useSavedAddress = (addr: Address) => {
    setAddress({
      fullName: addr.fullName,
      phone: addr.phone,
      governorate: addr.governorate,
      city: addr.city,
      details: addr.details,
    });
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const order = await orderService.create({
        shippingAddress: address,
        shippingMethod,
        paymentMethod,
      });
      setOrderId(order._id);

      if (paymentMethod === "stripe") {
        const { clientSecret } = await paymentService.createPaymentIntent(
          order._id,
        );
        setClientSecret(clientSecret);
      } else {
        router.push(`/order/success/${order._id}`);
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Something went wrong creating your order",
      );
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0 && !orderId) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        Your cart is empty, add some products first.
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <Stepper activeStep={activeStep} alternativeLabel className="mb-10">
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step 1: Shipping Address */}
      {activeStep === 0 && (
        <div className="space-y-4 pt-3">
          {!!user?.addresses?.length && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">
                Use a saved address
              </p>
              <div className="flex flex-wrap gap-4">
                {user.addresses.map((addr) => (
                  <Chip
                    key={addr._id}
                    label={`${addr.fullName} - ${addr.city}`}
                    onClick={() => useSavedAddress(addr)}
                    clickable
                    variant="outlined"
                  />
                ))}
              </div>
            </div>
          )}
          <div className="pt-2">
            <TextField
              label="Full name"
              fullWidth
              value={address.fullName}
              onChange={(e) =>
                setAddress({ ...address, fullName: e.target.value })
              }
            />
          </div>
          <div>
            <TextField
              label="Phone number"
              fullWidth
              value={address.phone}
              onChange={(e) =>
                setAddress({ ...address, phone: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <TextField
              label="Governorate"
              fullWidth
              value={address.governorate}
              onChange={(e) =>
                setAddress({ ...address, governorate: e.target.value })
              }
            />
            <TextField
              label="City"
              fullWidth
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
            />
          </div>
          <TextField
            label="Address details"
            fullWidth
            multiline
            rows={2}
            value={address.details}
            onChange={(e) =>
              setAddress({ ...address, details: e.target.value })
            }
          />
          <div className="py-3">
            <MuiButton
              variant="contained"
              fullWidth
              disabled={!isAddressValid}
              onClick={() => setActiveStep(1)}
              className="!bg-(--color-primary) !rounded-full !py-3 !text-white"
            >
              Next
            </MuiButton>
          </div>
        </div>
      )}

      {/* Step 2: Shipping Method */}
      {activeStep === 1 && (
        <div className="space-y-4 pt-3">
          <RadioGroup
            value={shippingMethod}
            onChange={(e) => setShippingMethod(e.target.value as any)}
          >
            <div className="border rounded-xl p-4 flex justify-between items-center">
              <FormControlLabel
                value="standard"
                control={<Radio />}
                label="Standard shipping (3-5 days)"
              />
              <span className="font-semibold">$50.00</span>
            </div>
            <div className="border rounded-xl p-4 flex justify-between items-center mt-2">
              <FormControlLabel
                value="express"
                control={<Radio />}
                label="Express shipping (1-2 days)"
              />
              <span className="font-semibold">$100.00</span>
            </div>
          </RadioGroup>
          <div className="flex gap-3">
            <MuiButton
              variant="outlined"
              fullWidth
              onClick={() => setActiveStep(0)}
            >
              Back
            </MuiButton>
            <MuiButton
              variant="contained"
              fullWidth
              onClick={() => setActiveStep(2)}
              className=" !bg-(--color-primary) !text-white"
            >
              Next
            </MuiButton>
          </div>
        </div>
      )}

      {/* Step 3: Payment Method */}
      {activeStep === 2 && (
        <div className="space-y-4 pt-3">
          <RadioGroup
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
          >
            <FormControlLabel
              value="cod"
              control={<Radio />}
              label="Cash on delivery"
              className="border rounded-xl p-4"
            />
            <FormControlLabel
              value="stripe"
              control={<Radio />}
              label="Credit card (Stripe)"
              className="border rounded-xl p-4 mt-2"
            />
          </RadioGroup>
          <div className="flex gap-3">
            <MuiButton
              variant="outlined"
              fullWidth
              onClick={() => setActiveStep(1)}
            >
              Back
            </MuiButton>
            <MuiButton
              variant="contained"
              fullWidth
              onClick={() => setActiveStep(3)}
              className="!bg-(--color-primary)"
            >
              Next
            </MuiButton>
          </div>
        </div>
      )}

      {/* Step 4: Review + Place Order */}
      {activeStep === 3 && (
        <div className="space-y-6 pt-3">
          <div className="border rounded-2xl p-4">
            <h3 className="font-bold mb-3">Order summary</h3>
            {items.map((i) => (
              <div
                key={i.product._id}
                className="flex justify-between text-sm py-1"
              >
                <span>
                  {i.product.title} × {i.quantity}
                </span>
                <span>
                  $
                  {(
                    i.product.price *
                    (1 - i.product.discountPercentage / 100) *
                    i.quantity
                  ).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="border-t mt-2 pt-2 flex justify-between text-sm">
              <span>Shipping</span>
              <span>${shippingCost}</span>
            </div>
            <div className="flex justify-between font-bold mt-1">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {!orderId ? (
            <MuiButton
              variant="contained"
              fullWidth
              size="large"
              disabled={placing}
              onClick={handlePlaceOrder}
              className="!bg-(--color-primary) !rounded-full !py-3"
            >
              {placing ? "Placing order..." : "Place order"}
            </MuiButton>
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripePaymentForm orderId={orderId} />
            </Elements>
          ) : null}
        </div>
      )}
    </main>
  );
}
