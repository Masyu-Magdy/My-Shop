import crypto from "crypto";

export const createRawToken = (): string => crypto.randomBytes(32).toString("hex");

export const hashToken = (rawToken: string): string =>
  crypto.createHash("sha256").update(rawToken).digest("hex");
