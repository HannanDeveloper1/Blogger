import { NextFunction, Request, Response, Router } from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware";
import validateBody from "../middlewares/validate.middleware";
import { registerSchema } from "../schemas/validation.schemas";
import { registerUser } from "../controllers/auth.controllers";

const router = Router();

// Register user - route
router.post("/register", validateBody(registerSchema), registerUser);

export default router;
