import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";

export default function authGuardOptional(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = jwt.verify(
        header.split(" ")[1],
        env.JWT_SECRET as string
      ) as { userId: string };
      req.user = { id: payload.userId };
    } catch {}
  }
  next();
}
