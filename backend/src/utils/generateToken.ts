import jwt from "jsonwebtoken";
import { Response } from "express";


export const generateAccessToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = process.env.JWT_EXPIRES_IN || "15m";
  return jwt.sign({ id: userId }, secret, { expiresIn } as jwt.SignOptions);
};

export const generateRefreshToken = (userId: string, tokenVersion: number): string => {
  const secret = process.env.REFRESH_TOKEN_SECRET as string;
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d";
  return jwt.sign({ id: userId, tokenVersion }, secret, { expiresIn } as jwt.SignOptions);
};

export const verifyRefreshToken = (token: string): { id: string; tokenVersion: number } =>
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string) as {
    id: string;
    tokenVersion: number;
  };

export const generateToken = generateAccessToken;

export const sendAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 15 * 60 * 1000, 
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/api/auth", 
    maxAge: 30 * 24 * 60 * 60 * 1000, 
  });
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("token");
  res.clearCookie("refreshToken", { path: "/api/auth" });
};

export const sendTokenCookie = (res: Response, token: string) => {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 15 * 60 * 1000,
  });
};
