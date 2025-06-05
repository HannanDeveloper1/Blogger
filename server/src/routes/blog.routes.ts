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
import rateLimiter from "../utils/rateLimiter";

const router = Router();

const createBlogLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many post creation requests. Slow down and try again.",
});
router.post(
  "/",
  createBlogLimiter,
  authGuard,
  authenticateMiddleware,
  validateBody(createBlogSchema),
  createBlog
);

const listBlogLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 50,
  message: "Too many post creation requests. Slow down and try again.",
});
router.get("/", listBlogLimiter, validateQuery(paginationSchema), getBlogs);

const updateBlogLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  message: "Too many post update attempts. Please try again later.",
});
router.put(
  "/:id",
  updateBlogLimiter,
  authGuard,
  authenticateMiddleware,
  validateParams(singleBlogSchema),
  validateBody(updateBlogSchema),
  updateBlog
);

const deleteBlogLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 5,
  message: "Too many post deletion attempts. Please try again later.",
});
router.delete(
  "/:id",
  deleteBlogLimiter,
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
const readBlogLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 100,
  message: "Too many read requests. Slow down and try again.",
});
router.get(
  "/:id",
  readBlogLimiter,
  authGuardOptional,
  authenticateOptionalMiddleware,
  validateParams(singleBlogSchema),
  getSingleBlog
);

export default router;
