// src/middlewares/authGuard.ts
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import env from "../config/env";
import ErrorHandler from "../utils/errorHandler";

export default function authGuard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new ErrorHandler("No token provided", 401));
  }

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, env.JWT_SECRET as jwt.Secret) as {
      userId: string;
    };
    // Stash only the minimal info into req.user:
    req.user = { id: payload.userId };
    return next();
  } catch (err) {
    return next(new ErrorHandler("Invalid or expired token", 401));
  }
}
