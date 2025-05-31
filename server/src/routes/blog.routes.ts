import { Router } from "express";
import authGuard from "../middlewares/authGuard.middleware";
import authenticateMiddleware from "../middlewares/authenticator.middleware";
import { createBlogSchema } from "../schemas/blog.schemas";
import { createBlog } from "../controllers/blog.controller";
import validateBody from "../middlewares/validate.middleware";

const router = Router();

router.post(
  "/",
  authGuard,
  authenticateMiddleware,
  validateBody(createBlogSchema),
  createBlog
);

export default router;
