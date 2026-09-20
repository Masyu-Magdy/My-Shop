import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "../utils/ApiError";

type Target = "body" | "query" | "params";

export const validate =
  (schema: ZodSchema, target: Target = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const message = result.error.errors[0]?.message || "Invalid request data";
      throw new ApiError(422, message);
    }
    (req as any)[target] = result.data;
    next();
  };
