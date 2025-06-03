import { Router } from "express";
import authGuard from "../middlewares/authGuard.middleware";
import authenticateMiddleware from "../middlewares/authenticator.middleware";
import {
  getMyProfile,
  updateMyProfile,
} from "../controllers/profile.controllers";
import validateBody from "../middlewares/validate.middleware";
import { updateProfileSchema } from "../schemas/profile.schemas";

const router = Router();

router.use(authGuard, authenticateMiddleware); // As every route here, requires to logged in

router.get("/profile", getMyProfile);

router.put("/profile", validateBody(updateProfileSchema), updateMyProfile);

export default router;
