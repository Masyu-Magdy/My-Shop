import mongoose from "mongoose";

// On Vercel a "cold" function instance can be reused for several requests.
// Without this cache, every invocation would try to open a brand-new
// connection, which is slow and can exhaust MongoDB's connection limit.
let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return; // already connected on this warm instance
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(uri, {
      // Fail fast (5s) instead of buffering for the 10s+ default — makes
      // network/allowlist/URI problems show up as a clear error quickly
      // instead of a generic buffering-timeout on every query.
      serverSelectionTimeoutMS: 5000,
    });
  }

  try {
    await connectionPromise;
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    // Let the caller (the request handler) turn this into a 500 response.
    // process.exit(1) must NOT be used here: in a serverless function it
    // would kill the whole instance instead of just failing one request.
    connectionPromise = null;
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
};
