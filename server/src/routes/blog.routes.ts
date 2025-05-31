import { Router } from "express";
import authGuard from "../middlewares/authGuard.middleware";
import authenticateMiddleware from "../middlewares/authenticator.middleware";
import { createBlogSchema, paginationSchema } from "../schemas/blog.schemas";
import { createBlog, getBlogs } from "../controllers/blog.controller";
import validateBody from "../middlewares/validate.middleware";
import validateQuery from "../middlewares/validateQuery.middleware";

const router = Router();

router.post(
  "/",
  authGuard,
  authenticateMiddleware,
  validateBody(createBlogSchema),
  createBlog
);

router.get("/", validateQuery(paginationSchema), getBlogs);

export default router;
