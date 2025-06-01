import { Router } from "express";
import authGuard from "../middlewares/authGuard.middleware";
import authenticateMiddleware from "../middlewares/authenticator.middleware";
import { getMyProfile } from "../controllers/profile.controllers";

const router = Router();

router.use(authGuard, authenticateMiddleware); // As every route here, requires to logged in

router.get("/profile", getMyProfile);

export default router;
