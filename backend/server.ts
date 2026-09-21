// Local development entry point only. On Vercel, requests go through
// api/index.ts instead (see vercel.json) — this file is never executed
// in production, since Vercel functions can't stay alive on a listening
// port the way `app.listen` expects.
import dotenv from "dotenv";
dotenv.config();

import app from "./src/app";
import { connectDB } from "./src/config/db";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer();
