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
  return (
    "Bearer " +
    jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: parseInt(env.ACCESS_TOKEN_EXP_MINS) * 60 * 1000,
    })
  );
}

// Issue a refresh token (longer lived, stored in Redis)
export async function issueRefreshToken(userId: string): Promise<string> {
  const tokenId = crypto.randomBytes(32).toString("hex");
  const key = `refresh:${tokenId}`;

  await client.set(key, userId, {
    EX: parseInt(env.ACCESS_TOKEN_EXP_MINS) * 60,
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

// Reset Tokens
export async function issueResetToken(userId: string): Promise<string> {
  // 32 bytes = 64 hex chars
  const nonce = crypto.randomBytes(32).toString("hex");
  const key = `reset:${userId}:${nonce}`;
  // TTL in seconds (e.g. 3600 = 1 hour)
  const ttl = 60 * 60;

  await client.set(key, "1", { EX: ttl });
  return nonce;
}
export async function verifyResetToken(
  userId: string,
  nonce: string
): Promise<void> {
  const key = `reset:${userId}:${nonce}`;
  const exists = await client.get(key);

  if (!exists) {
    throw new Error("Invalid or expired reset token");
  }

  await client.del(key);
}

// Email verification
export async function issueVerifyToken(userId: string): Promise<string> {
  const nonce = crypto.randomBytes(16).toString("hex");
  const key = `verify:${userId}:${nonce}`;
  await client.set(key, "1", {
    EX: 24 * 60 * 60 * 60,
  });
  return nonce;
}
export async function verifyVerifyToken(
  userId: string,
  nonce: string
): Promise<void> {
  const key = `verify:${userId}:${nonce}`;
  const ok = await client.get(key);
  if (!ok) {
    throw new Error("Invalid or expired verification token");
  }
  await client.del(key);
}
