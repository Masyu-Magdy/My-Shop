"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button as MuiButton } from "@mui/material";

export default function ForbiddenPage() {
  return (
    <main className=" max-w-2xl mx-auto px-4 py-40 text-center">
      <ShieldAlert size={72} className="mx-auto text-amber-500 mb-4" />
      <h1 className="text-3xl font-extrabold">403</h1>
      <p className="text-lg font-semibold mt-1">You don't have access to this page</p>
      <p className="text-gray-500 mt-2">This page is reserved for the admin team.</p>

      <Link href="/">
        <MuiButton variant="contained" className="!bg-(--color-primary) !rounded-full !px-6 !mt-8">
          Back to home
        </MuiButton>
      </Link>
    </main>
  );
}
