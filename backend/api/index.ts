import type { VercelRequest, VercelResponse } from "@vercel/node";
import app from "../src/app";
import { connectDB } from "../src/config/db";

// Vercel parses the request body for you by default, which would consume
// the raw stream before Express sees it. That breaks express.json() AND,
// critically, the Stripe webhook route which needs express.raw() on the
// untouched body to verify the signature. Turning this off lets Express
// do all body parsing itself, exactly like it does when run with app.listen().
export const config = {
  api: {
    bodyParser: false,
  },
};

// This is the single entry point Vercel calls for every request (see
// vercel.json, which rewrites everything to /api/index). It makes sure
// the MongoDB connection is ready, then delegates to the normal Express
// app — all existing routes, middleware and error handling stay as-is.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connectDB();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
    return;
  }

  // Express apps are valid (req, res) request handlers, so we can just
  // call it directly — this is the standard way to run Express on
  // Vercel's Node.js runtime.
  return (app as unknown as (req: VercelRequest, res: VercelResponse) => void)(req, res);
}
