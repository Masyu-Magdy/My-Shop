import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import { User, IUser } from "../models/User";
import { ApiError } from "../utils/ApiError";

declare global {
  namespace Express {
    interface User extends IUser {}
    interface Request {
      guestId?: string;
    }
  }
}

const extractToken = (req: Request): string | undefined => {
  if (req.cookies?.token) return req.cookies.token;
  if (req.headers.authorization?.startsWith("Bearer ")) {
    return req.headers.authorization.split(" ")[1];
  }
  return undefined;
};

export const protect = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractToken(req);

    if (!token) {
      throw new ApiError(401, "Unauthorized, please log in first");
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        id: string;
      };

      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new ApiError(401, "User not found or account is suspended");
      }

      req.user = user;
      next();
    } catch {
      throw new ApiError(401, "Your session is invalid or has expired");
    }
  }
);

export const isAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    throw new ApiError(403, "You are not allowed to perform this action");
  }
  next();
};

export const identify = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token = extractToken(req);

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
        const user = await User.findById(decoded.id);
        if (user && user.isActive) {
          req.user = user;
          return next();
        }
      } catch {
      }
    }

    let guestId = req.cookies?.guestId;
    if (!guestId) {
      guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      res.cookie("guestId", guestId, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 90 * 24 * 60 * 60 * 1000, 
      });
    }
    req.guestId = guestId;
    next();
  }
);