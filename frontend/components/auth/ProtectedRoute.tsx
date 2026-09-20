"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
    } else if (adminOnly && user.role !== "admin") {
      router.replace("/403");
    }
  }, [user, isLoading, adminOnly, router]);

  if (isLoading || !user || (adminOnly && user.role !== "admin")) {
    return <div className="max-w-4xl mx-auto px-4 py-24 text-center text-gray-500">Checking access...</div>;
  }

  return <>{children}</>;
}
