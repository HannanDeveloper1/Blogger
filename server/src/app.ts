import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import env from "./config/env";
import errorMiddleware from "./middlewares/error.middleware";
import logger from "./utils/logger";
import ErrorHandler from "./utils/errorHandler";

const app = express();

app.use(morgan("dev"));

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
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.get("/", (req, res) => {
  res.send("Welcome to the Blogger API!");
});

app.get("/error", (req, res, next) => {
  next(new ErrorHandler("This is a test error!", 500));
});

app.use(errorMiddleware); // Error handling middleware

export default app;
