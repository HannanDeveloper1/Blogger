import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import morgan from "morgan";
import env from "./config/env";
import csurf from "csurf";

import logger from "./utils/logger";

import authRoutes from "./routes/auth.routes";
import blogRoutes from "./routes/blog.routes";

import forceHttps from "./middlewares/forceHTTPS.middleware";
import errorMiddleware from "./middlewares/error.middleware";
import profileRouter from "./routes/profile.routes";

const app = express();
const csrfProtection = csurf({
  cookie: true, // Enable CSRF protection with cookies
});

// Middleware setup
app.set("trust proxy", 1);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true, // Allow cookies to be sent with requests
  })
);
app.use(cookieParser());
app.use(morgan("dev"));
app.use(helmet()); // Security middleware to set various HTTP headers
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);
// app.use(csrfProtection); // CSRF protection middleware disabled for now

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/account", profileRouter);

app.use(errorMiddleware); // Error handling middleware
// app.use(forceHttps);

export default app;
