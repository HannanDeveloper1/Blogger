import { Router } from "express";
import authGuard from "../middlewares/authGuard.middleware";
import authenticateMiddleware from "../middlewares/authenticator.middleware";
import {
  userBlogsSchema,
  createBlogSchema,
  paginationSchema,
  singleBlogSchema,
  updateBlogSchema,
} from "../schemas/blog.schemas";
import {
  createBlog,
  deleteBlog,
  getBlogs,
  getSingleBlog,
  getUserBlogs,
  updateBlog,
} from "../controllers/blog.controllers";
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

router.put(
  "/:id",
  authGuard,
  authenticateMiddleware,
  validateParams(singleBlogSchema),
  validateBody(updateBlogSchema),
  updateBlog
);

router.delete(
  "/:id",
  authGuard,
  authenticateMiddleware,
  validateParams(singleBlogSchema),
  deleteBlog
);

router.get(
  "/user",
  authGuard,
  authenticateMiddleware,
  validateQuery(userBlogsSchema),
  getUserBlogs
);

// On end so that it will no overlap with other routes
router.get(
  "/:id",
  authGuardOptional,
  authenticateOptionalMiddleware,
  validateParams(singleBlogSchema),
  getSingleBlog
);

export default router;
