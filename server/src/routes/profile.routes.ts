import { Router } from "express";
import authGuard from "../middlewares/authGuard.middleware";
import authenticateMiddleware from "../middlewares/authenticator.middleware";
import {
  getMyProfile,
  updateMyProfile,
  updatePassword,
} from "../controllers/profile.controllers";
import validateBody from "../middlewares/validate.middleware";
import {
  updatePasswordSchema,
  updateProfileSchema,
} from "../schemas/profile.schemas";

const router = Router();

router.use(authGuard, authenticateMiddleware); // As every route here, requires to logged in

router.get("/profile", getMyProfile);

router.put("/profile", validateBody(updateProfileSchema), updateMyProfile);

router.put("/password", validateBody(updatePasswordSchema), updatePassword);

export default router;
