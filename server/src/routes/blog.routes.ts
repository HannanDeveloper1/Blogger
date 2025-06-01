import { Router } from "express";
import authGuard from "../middlewares/authGuard.middleware";
import authenticateMiddleware from "../middlewares/authenticator.middleware";
import {
  createBlogSchema,
  paginationSchema,
  singleBlogSchema,
} from "../schemas/blog.schemas";
import {
  createBlog,
  getBlogs,
  getSingleBlog,
} from "../controllers/blog.controller";
import validateBody from "../middlewares/validate.middleware";
import validateQuery from "../middlewares/validateQuery.middleware";
import validateParams from "../middlewares/validateParams.middleware";
import authGuardOptional from "../middlewares/authGuardOptional.middleware";
import authenticateOptionalMiddleware from "../middlewares/authenticatorOptional.middleware";

const router = Router();

router.post(
  "/",
  authGuard,
  authenticateMiddleware,
  validateBody(createBlogSchema),
  createBlog
);

router.get("/", validateQuery(paginationSchema), getBlogs);

router.get(
  "/:id",
  authGuardOptional,
  authenticateOptionalMiddleware,
  validateParams(singleBlogSchema),
  getSingleBlog
);

export default router;
