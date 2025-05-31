import { Request, Response, NextFunction } from "express";

export default function forceHttps(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    return next();
  }
  // Redirect to the same URL but with https
  return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
}
