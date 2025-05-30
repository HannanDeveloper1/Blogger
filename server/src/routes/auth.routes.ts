import { Router } from "express";
import validateBody from "../middlewares/validate.middleware";
import {
  forgetPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../schemas/auth.schemas";
import {
  forgetPassword,
  loginUser,
  refreshToken,
  registerUser,
  resetPassword,
  sendVerification,
  verifyEmail,
} from "../controllers/auth.controllers";
import rateLimiter from "../utils/rateLimiter";
import authGuard from "../middlewares/authGuard";

const router = Router();

// Register user - route
const registerLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
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
  windowMs: 10 * 60 * 1000, // 10 minutes
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

// Forget & reset password - routes
const forgetLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: "Password reset limit reached—please try again in an hour.",
});
router.post(
  "/forget-password",
  forgetLimiter,
  validateBody(forgetPasswordSchema),
  forgetPassword
);

const resetLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many password reset attempts—please request a new link.",
});
router.put(
  "/reset-password",
  resetLimiter,
  authGuard,
  validateBody(resetPasswordSchema),
  resetPassword
);

// Email verifications
router.post("/send-verification", authGuard, sendVerification);

const verifyLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message:
    "Too many verification attempts—please request a new verification email.",
});
router.put("/verify-email", verifyLimiter, verifyEmail);

export default router;
