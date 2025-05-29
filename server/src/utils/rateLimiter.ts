import rateLimit from "express-rate-limit";
import RedisStore, { RedisReply } from "rate-limit-redis";
import Redis from "ioredis";
import env from "../config/env";

const redisClient = new Redis(env.REDIS_URL);

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message?: string;
}

export default function rateLimiter(options: RateLimiterOptions) {
  return rateLimit({
    windowMs: options.windowMs, // Time window in milliseconds
    max: options.max, // Maximum number of requests allowed within the window
    standardHeaders: true, // Send standard rate limit headers
    legacyHeaders: false, // Disable legacy headers,
    message: {
      success: false,
      message: options.message || "Too many requests, please try again later.",
    },
    store: new RedisStore({
      sendCommand: (...args: [string, ...any[]]): Promise<RedisReply> =>
        redisClient.call(...args) as Promise<RedisReply>,
    }),
  });
}
