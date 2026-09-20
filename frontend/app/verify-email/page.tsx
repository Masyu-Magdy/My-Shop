"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/providers/AuthProvider";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { refetchUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    authService
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
        refetchUser?.();
      })
      .catch(() => setStatus("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <main className="max-w-md mx-auto px-4 py-24 text-center">
      {status === "loading" && (
        <>
          <Loader2 size={44} className="mx-auto animate-spin text-(--color-primary) mb-4" />
          <h1 className="text-xl font-bold">Verifying your email...</h1>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle2 size={48} className="mx-auto text-(--color-accent) mb-4" />
          <h1 className="text-xl font-bold">Email verified!</h1>
          <p className="text-gray-500 mt-2 text-sm">Your account is now fully active.</p>
          <Link href="/" className="inline-block mt-6 text-(--color-primary) font-semibold text-sm">
            Continue shopping
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <XCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-xl font-bold">Verification failed</h1>
          <p className="text-gray-500 mt-2 text-sm">This link is invalid or has expired.</p>
          <Link href="/profile" className="inline-block mt-6 text-(--color-primary) font-semibold text-sm">
            Go to your profile to resend it
          </Link>
        </>
      )}
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto px-4 py-24 text-center">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
