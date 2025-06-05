import { Router } from "express";
import authGuard from "../middlewares/authGuard.middleware";
import authenticateMiddleware from "../middlewares/authenticator.middleware";
import {
  deleteMyAccount,
  getMyProfile,
  updateMyProfile,
  updatePassword,
} from "../controllers/profile.controllers";
import validateBody from "../middlewares/validate.middleware";
import {
  updatePasswordSchema,
  updateProfileSchema,
} from "../schemas/profile.schemas";
import rateLimiter from "../utils/rateLimiter";

const router = Router();

router.use(authGuard, authenticateMiddleware); // As every route here, requires to logged in

router.get("/profile", getMyProfile);

router.put("/profile", validateBody(updateProfileSchema), updateMyProfile);

const changePasswordLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: "Too many password change attempts. Please wait a minute.",
});
router.put(
  "/password",
  changePasswordLimiter,
  validateBody(updatePasswordSchema),
  updatePassword
);

const deleteAccountLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 3,
  message: "Too many delete attempts. Please try again later.",
});
router.delete("/", deleteAccountLimiter, deleteMyAccount);

export default router;
