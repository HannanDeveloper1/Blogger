import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;

  console.log(
    "Error:",
    err.message,
    "Status:",
    err.statusCode,
    "Stack:",
    err.stack
  );

  if (err.code === "EBADCSRFTOKEN") {
    logger.warn({
      event: "csrf_failure",
      ip: req.ip,
      route: req.originalUrl,
      message: "CSRF token invalid or missing",
    });
    res.status(403).json({ error: "Invalid CSRF token" });
  }

  logger.error({
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export default errorMiddleware;
