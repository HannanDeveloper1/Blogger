import { createLogger, format, transports } from "winston";
import path from "path";
import fs from "fs";
import env from "../config/env";

// Ensure logs directory exists
const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

// Common log format
const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ timestamp, level, message, metadata }) => {
    const meta =
      metadata && Object.keys(metadata).length ? JSON.stringify(metadata) : "";
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${meta}`;
  })
);

// Create logger with separate files and rotation
const logger = createLogger({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  format: logFormat,
  transports: [
    new transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    new transports.File({
      filename: path.join(logDir, "warn.log"),
      level: "warn",
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
    new transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new transports.File({ filename: path.join(logDir, "exceptions.log") }),
  ],
  rejectionHandlers: [
    new transports.File({ filename: path.join(logDir, "rejections.log") }),
  ],
});

// In development, also log to console
if (env.NODE_ENV === "development") {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), logFormat),
    })
  );
}

export default logger;
