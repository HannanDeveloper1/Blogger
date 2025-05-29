import { Router } from "express";
import validateBody from "../middlewares/validate.middleware";
import { loginSchema, registerSchema } from "../schemas/validation.schemas";
import {
  loginUser,
  refreshToken,
  registerUser,
} from "../controllers/auth.controllers";
import rateLimiter from "../utils/rateLimiter";

const router = Router();

// Register user - route
const registerLimiter = rateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit to 10 requests per window
  message: "Too many sign-up attempts, please try again in 15 minutes.",
});
router.post(
  "/register",
  registerLimiter,
  validateBody(registerSchema),
  registerUser
);

// Login user - route
const loginLimiter = rateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please wait 10 minutes or reset password.",
});
router.post("/login", loginLimiter, validateBody(loginSchema), loginUser);

// Refresh Acess Token - route
const refreshLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour,
  max: 20, // Limit to 5 requests per window,
  message: "Too many session refreshes, please re-login.",
});
router.put("/refresh-token", refreshLimiter, refreshToken);

export default router;
