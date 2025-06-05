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
  logoutUser,
  refreshToken,
  registerUser,
  resetPassword,
  sendVerification,
  verifyEmail,
} from "../controllers/auth.controllers";
import rateLimiter from "../utils/rateLimiter";
import authGuard from "../middlewares/authGuard.middleware";
import authenticateMiddleware from "../middlewares/authenticator.middleware";

const router = Router();

// Register user - route
const registerLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 min
  max: 3, // Limit to 10 requests per window
  message: "Too many registration attempts. Please try again later.",
});
router.post(
  "/register",
  registerLimiter,
  validateBody(registerSchema),
  registerUser
);

// Login user - route
const loginLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: "Too many login attempts. Please try again in a minute.",
});
router.post("/login", loginLimiter, validateBody(loginSchema), loginUser);

// Refresh Acess Token - route
const refreshLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 hour,
  max: 30,
  message: "Too many token refresh attempts. Please try again later.",
});
router.put("/refresh-token", refreshLimiter, refreshToken);

// Forget & reset password - routes
const forgetLimiter = rateLimiter({
  windowMs: 10 * 60 * 1000, // 10 min
  max: 3,
  message: "Too many password reset requests. Please try again later.",
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

router.get("/logout", authGuard, authenticateMiddleware, logoutUser);

export default router;
