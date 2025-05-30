// src/middleware/authGuard.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";
import ErrorHandler from "../utils/errorHandler";

interface JwtPayload {
  userId: string;
}

/**
 * Attach only for routes that require a logged-in user.
 */
export default function authGuard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  console.log(header);
  if (!header || !header.startsWith("Bearer ")) {
    return next(new ErrorHandler("No authorization token provided", 401));
  }

  const token = header.slice(7); // remove "Bearer "
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    // Attach user info for downstream handlers
    (req as any).user = { id: payload.userId };
    next();
  } catch (err) {
    return next(new ErrorHandler("Invalid or expired token", 401));
  }
}
