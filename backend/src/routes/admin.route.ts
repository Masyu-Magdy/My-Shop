import { Router } from "express";
import { getDashboardStats, getUsers, updateUserStatus } from "../controllers/admin.controller";
import { protect, isAdmin } from "../middleware/auth";

const router = Router();

router.use(protect, isAdmin);

router.get("/dashboard", getDashboardStats);
router.get("/users", getUsers);
router.patch("/users/:id/status", updateUserStatus);

export default router;
