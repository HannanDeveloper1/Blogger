import { NextFunction, Request, Response, Router } from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware";
import validateBody from "../middlewares/validate.middleware";
import { loginSchema, registerSchema } from "../schemas/validation.schemas";
import { loginUser, registerUser } from "../controllers/auth.controllers";

const router = Router();

// Register user - route
router.post("/register", validateBody(registerSchema), registerUser);

// Login user - route
router.post("/login", validateBody(loginSchema), loginUser);

export default router;
