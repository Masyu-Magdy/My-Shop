import { Router } from "express";

const router = Router();

router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is up and running 🚀",
    timestamp: new Date().toISOString(),
  });
});

export default router;
