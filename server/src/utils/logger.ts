import { createLogger, format, transports } from "winston";
import path from "path";
import env from "../config/env";

// Ensure logs directory exists
import fs from "fs";
const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const logger = createLogger({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(
      ({ timestamp, level, message, stack }) =>
        `${timestamp} [${level.toUpperCase()}]: ${stack || message}`
    )
  ),
  transports: [
    // Combined log file (rotates on size, keeps last 5 files)
    new transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    // Error log file
    new transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
    // Warning log file
    new transports.File({
      filename: path.join(logDir, "warn.log"),
      level: "warn",
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

// In development, also log to console
if (env.NODE_ENV === "development") {
  logger.add(new transports.Console());
}

export default logger;
