"use client";

import { useState } from "react";
import Link from "next/link";
import { TextField, Button as MuiButton } from "@mui/material";
import { MailCheck, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Something went wrong, please try again",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-20">
      <Link
        href="/login"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-(--color-primary) mb-6"
      >
        <ArrowLeft size={14} /> Back to sign in
      </Link>

      {sent ? (
        <div className="text-center border rounded-2xl p-8">
          <MailCheck size={48} className="mx-auto text-(--color-accent) mb-4" />
          <h1 className="text-xl font-bold">Check your inbox</h1>
          <p className="text-gray-500 mt-2 text-sm">
            If an account exists for <strong>{email}</strong>, we&apos;ve sent a
            link to reset your password. It expires in 1 hour.
          </p>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-1">Forgot your password?</h1>
          <p className="text-gray-500 mb-6 text-sm">
            Enter the email on your account and we&apos;ll send you a reset
            link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <TextField
                label="Email address"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <MuiButton
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              className="!bg-(--color-primary) !rounded-full !py-3"
            >
              {loading ? "Sending..." : "Send reset link"}
            </MuiButton>
          </form>
        </>
      )}
    </main>
  );
}
