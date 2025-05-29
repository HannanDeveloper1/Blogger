// src/utils/tokens.ts
import jwt from "jsonwebtoken";
import crypto from "crypto";
import client from "../config/redisClient";
import env from "../config/env";

export interface JWTPayload {
  userId: string;
  role?: string;
}

// Create a signed JWT (short-lived)
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: parseInt(env.ACCESS_TOKEN_EXP_MINS) * 24 * 60 * 60 * 1000,
  });
}

// Issue a refresh token (longer lived, stored in Redis)
export async function issueRefreshToken(userId: string): Promise<string> {
  const tokenId = crypto.randomBytes(32).toString("hex");
  const key = `refresh:${tokenId}`;

  await client.set(key, userId, {
    EX: parseInt(env.REFRESH_TOKEN_EXP_DAYS) * 24 * 60 * 60 * 1000,
  });
  return tokenId;
}

// Verify a refresh token (throws if invalid/expired)
export async function verifyRefreshToken(tokenId: string): Promise<string> {
  const key = `refresh:${tokenId}`;
  const userId = await client.get(key);
  if (!userId) throw new Error("Invalid or expired refresh token");
  return userId;
}

// Revoke a refresh token
export async function revokeRefreshToken(tokenId: string): Promise<void> {
  await client.del(`refresh:${tokenId}`);
}
