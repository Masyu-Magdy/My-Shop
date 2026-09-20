"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TextField,
  Button as MuiButton,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Divider,
} from "@mui/material";
import { ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/AuthProvider";
import { authService } from "@/services/auth.service";

const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score += 25;
  if (/[A-Z]/.test(password)) score += 25;
  if (/[0-9]/.test(password)) score += 25;
  if (/[^A-Za-z0-9]/.test(password)) score += 25;
  return score;
};

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      return toast.error("Passwords don't match");
    }
    if (!agreed) {
      return toast.error("Please agree to the terms and conditions first");
    }

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      toast.success(
        "Account created! Check your email to verify your address.",
      );
      router.push("/");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "Something went wrong creating your account",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] grid md:grid-cols-2">
      <div className="hidden md:flex mesh-bg text-white flex-col justify-between p-12 relative overflow-hidden">
        <Link href="/" className="flex items-center gap-2 relative z-10">
          <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
            <ShoppingBag size={18} />
          </span>
          <span
            className="font-extrabold text-lg"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Shoply
          </span>
        </Link>
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold leading-tight max-w-sm">
            Join thousands of happy shoppers.
          </h2>
          <p className="text-white/70 mt-3 max-w-sm">
            Create an account to track orders, save your favorites, and check
            out in seconds.
          </p>
        </div>
        <div className="float-slow absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
      </div>

      <div className="flex items-center justify-center px-4 py-2">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-gray-500 mb-6 text-sm">
            Join us and start shopping today.
          </p>

          <MuiButton
            component="a"
            href={authService.googleLoginUrl()}
            variant="outlined"
            fullWidth
            size="large"
            className="!rounded-full !py-3 !border-gray-300 !text-gray-700 !normal-case"
            startIcon={
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.48a5.55 5.55 0 0 1-2.4 3.64v3h3.9c2.28-2.1 3.54-5.2 3.54-8.83z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.96-1.08 7.95-2.9l-3.9-3c-1.08.72-2.46 1.15-4.05 1.15-3.12 0-5.76-2.1-6.7-4.93H1.28v3.1A12 12 0 0 0 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.3 14.32a7.2 7.2 0 0 1 0-4.64v-3.1H1.28a12 12 0 0 0 0 10.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.76c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.58l4.02 3.1C6.24 6.86 8.88 4.76 12 4.76z"
                />
              </svg>
            }
          >
            Continue with Google
          </MuiButton>

          <Divider className="!my-5 !text-gray-400 !text-xs">
            or sign up with email
          </Divider>

          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <TextField
                label="Full name"
                fullWidth
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <TextField
                label="Email address"
                type="email"
                fullWidth
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div>
              {" "}
              <TextField
                label="Phone number"
                fullWidth
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            <div>
              <TextField
                label="Password"
                type="password"
                fullWidth
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              {form.password && (
                <LinearProgress
                  variant="determinate"
                  value={strength}
                  className="!mt-1 !rounded-full"
                  color={
                    strength < 50
                      ? "error"
                      : strength < 100
                        ? "warning"
                        : "success"
                  }
                />
              )}
            </div>
            <div>
              <TextField
                label="Confirm password"
                type="password"
                fullWidth
                required
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              />
            </div>

            <FormControlLabel
              control={
                <Checkbox
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
              }
              label={
                <span className="text-sm">
                  I agree to the Terms &amp; Conditions
                </span>
              }
            />

            <MuiButton
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              className="!bg-(--color-primary) !rounded-full !py-3"
            >
              {loading ? "Creating account..." : "Create account"}
            </MuiButton>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-(--color-primary) font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
