"use client";

import { useEffect } from "react";
import { ServerCrash } from "lucide-react";
import { Button as MuiButton } from "@mui/material";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unexpected error:", error);
  }, [error]);

  return (
    <main className=" max-w-2xl mx-auto px-4 py-40 text-center">
      <ServerCrash size={72} className="mx-auto text-red-500 mb-4" />
      <h1 className="text-3xl font-extrabold">500</h1>
      <p className="text-lg font-semibold mt-1">Something went wrong on our end</p>
      <p className="text-gray-500 mt-2">Please try again in a moment. If the problem persists, contact support.</p>

      <div className="flex gap-3 justify-center mt-8">
        <MuiButton variant="contained" onClick={() => reset()} className="!bg-(--color-primary) !rounded-full !px-6">
          Try again
        </MuiButton>
        <MuiButton variant="outlined" href="/" className="!rounded-full !px-6">
          Back to home
        </MuiButton>
      </div>
    </main>
  );
}
