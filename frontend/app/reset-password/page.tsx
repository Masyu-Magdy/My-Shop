"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { TextField, Button as MuiButton, LinearProgress } from "@mui/material";
import { CheckCircle2, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { authService } from "@/services/auth.service";

const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score += 25;
  if (/[A-Z]/.test(password)) score += 25;
  if (/[0-9]/.test(password)) score += 25;
  if (/[^A-Za-z0-9]/.test(password)) score += 25;
  return score;
};

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return toast.error("Passwords don't match");
    if (!token) return toast.error("This reset link is invalid");

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "This reset link is invalid or has expired",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="max-w-md mx-auto px-4 py-20 text-center">
        <XCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h1 className="text-xl font-bold">Invalid link</h1>
        <p className="text-gray-500 mt-2 text-sm">
          This password reset link is missing or invalid.
        </p>
        <Link
          href="/forgot-password"
          className="inline-block mt-6 text-(--color-primary) font-semibold text-sm"
        >
          Request a new link
        </Link>
      </main>
    );
  }

  if (done) {
    return (
      <main className="max-w-md mx-auto px-4 py-20 text-center">
        <CheckCircle2
          size={48}
          className="mx-auto text-(--color-accent) mb-4"
        />
        <h1 className="text-xl font-bold">Password reset</h1>
        <p className="text-gray-500 mt-2 text-sm">
          Redirecting you to sign in...
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold mb-1">Set a new password</h1>
      <p className="text-gray-500 mb-6 text-sm">
        Choose a strong password you haven&apos;t used before.
      </p>

      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <TextField
            label="New password"
            type="password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {password && (
            <LinearProgress
              variant="determinate"
              value={strength}
              className="!mt-1 !rounded-full"
              color={
                strength < 50 ? "error" : strength < 100 ? "warning" : "success"
              }
            />
          )}
        </div>
        <div>
          <TextField
            label="Confirm new password"
            type="password"
            fullWidth
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <div>
          <MuiButton
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
            className="!bg-(--color-primary) !rounded-full !py-3"
          >
            {loading ? "Saving..." : "Reset password"}
          </MuiButton>
        </div>
      </form>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          Loading...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
