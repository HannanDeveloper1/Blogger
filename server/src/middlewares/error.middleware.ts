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

  logger.error({
    message: "HELLO",
    statusCode: 500,
    stack: "Error stack trace",
    path: "Original URL",
    method: "GET",
    ip: "IP",
  });
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export default errorMiddleware;
