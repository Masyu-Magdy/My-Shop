"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TextField, Button as MuiButton, IconButton, InputAdornment, Divider } from "@mui/material";
import { Eye, EyeOff, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/providers/AuthProvider";
import { authService } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success("Logged in successfully");
      router.push(user.role === "admin" ? "/admin" : "/");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[93vh] grid md:grid-cols-2">
      {/* Branding panel */}
      <div className="hidden md:flex mesh-bg text-white flex-col justify-between p-12 relative overflow-hidden">
        <Link href="/" className="flex items-center gap-2 relative z-10">
          <span className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
            <ShoppingCart size={18} />
          </span>
          <span className="font-extrabold text-lg" style={{ fontFamily: "var(--font-display)" }}>MyShop</span>
        </Link>
        <div className="relative z-10">
          <h2 className="text-3xl font-extrabold leading-tight max-w-sm">Welcome back to smarter shopping.</h2>
          <p className="text-white/70 mt-3 max-w-sm">
            Track orders, save favorites, and check out faster every time you sign in.
          </p>
        </div>
        <div className="float-slow absolute -right-16 -bottom-16 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-1">Sign in</h1>
          <p className="text-gray-500 mb-6 text-sm">Welcome back - sign in to continue.</p>

          <MuiButton
            component="a"
            href={authService.googleLoginUrl()}
            variant="outlined"
            fullWidth
            size="large"
            className="!rounded-full !py-3 !border-gray-300 !text-gray-700 !normal-case"
            startIcon={
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.48a5.55 5.55 0 0 1-2.4 3.64v3h3.9c2.28-2.1 3.54-5.2 3.54-8.83z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.9l-3.9-3c-1.08.72-2.46 1.15-4.05 1.15-3.12 0-5.76-2.1-6.7-4.93H1.28v3.1A12 12 0 0 0 12 24z" />
                <path fill="#FBBC05" d="M5.3 14.32a7.2 7.2 0 0 1 0-4.64v-3.1H1.28a12 12 0 0 0 0 10.84z" />
                <path fill="#EA4335" d="M12 4.76c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.58l4.02 3.1C6.24 6.86 8.88 4.76 12 4.76z" />
              </svg>
            }
          >
            Continue with Google
          </MuiButton>

          <Divider className="!my-5 !text-gray-400 !text-xs">or sign in with email</Divider>

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

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((v) => !v)}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <div className="text-end">
              <Link href="/forgot-password" className="text-sm text-(--color-primary)">
                Forgot your password?
              </Link>
            </div>

            <MuiButton
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              className="!bg-(--color-primary) !rounded-full !py-3"
            >
              {loading ? "Signing in..." : "Sign in"}
            </MuiButton>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-(--color-primary) font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
