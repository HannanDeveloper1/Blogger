import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true, // Allow cookies to be sent with requests
  })
);
app.use(cookieParser());

export default app;
