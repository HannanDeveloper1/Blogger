import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import env from "./config/env";

const app = express();

const logDirectory = path.join(__dirname, "../logs");
if (!fs.existsSync(logDirectory)) fs.mkdirSync(logDirectory);

// create a write stream (append mode)
const accessLogStream = fs.createWriteStream(
  path.join(logDirectory, "access.log"),
  { flags: "a" }
);
// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true, // Allow cookies to be sent with requests
  })
);
app.use(cookieParser());
app.use(helmet()); // Security middleware to set various HTTP headers
// Logging middleware and also create a various types of logs files in the logs folder
app.use(morgan("combined", { stream: accessLogStream }));

export default app;
