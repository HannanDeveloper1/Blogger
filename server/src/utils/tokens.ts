import * as jwt from "jsonwebtoken";
import crypto from "crypto";
import client from "../config/redisClient";
import env from "../config/env";
import type { StringValue } from "ms";

export interface JWTPayload {
  userId: string;
  role?: string;
}

export function generateAccessToken(payload: JWTPayload): string {
  const options: jwt.SignOptions = {
    expiresIn: env.ACCESS_TOKEN_EXP as StringValue,
  };
  const token = jwt.sign(payload, env.JWT_SECRET as jwt.Secret, options);
  return `Bearer ${token}`;
}

export async function issueRefreshToken(userId: string): Promise<string> {
  const tokenId = crypto.randomBytes(32).toString("hex");
  const key = `refresh:${tokenId}`;
  const ttlSeconds = parseInt(env.REFRESH_TOKEN_EXP_DAYS, 10) * 24 * 60 * 60;
  await client.set(key, userId, { EX: ttlSeconds });
  return tokenId;
}

export async function verifyRefreshToken(tokenId: string): Promise<string> {
  const key = `refresh:${tokenId}`;
  const userId = await client.get(key);
  if (!userId) throw new Error("Invalid or expired refresh token");
  return userId;
}

export async function revokeRefreshToken(tokenId: string): Promise<void> {
  await client.del(`refresh:${tokenId}`);
}

export async function issueResetToken(userId: string): Promise<string> {
  const nonce = crypto.randomBytes(32).toString("hex");
  const key = `reset:${userId}:${nonce}`;
  await client.set(key, "1", { EX: 3600 });
  return nonce;
}

export async function verifyResetToken(
  userId: string,
  nonce: string
): Promise<void> {
  const key = `reset:${userId}:${nonce}`;
  const exists = await client.get(key);
  if (!exists) throw new Error("Invalid or expired reset token");
  await client.del(key);
}

export async function issueVerifyToken(userId: string): Promise<string> {
  const nonce = crypto.randomBytes(32).toString("hex");
  const key = `verify:${userId}:${nonce}`;
  await client.set(key, "1", { EX: 86400 });
  return nonce;
}

export async function verifyEmailToken(
  userId: string,
  nonce: string
): Promise<void> {
  const key = `verify:${userId}:${nonce}`;
  const exists = await client.get(key);
  if (!exists) throw new Error("Invalid or expired verification token");
  await client.del(key);
}
