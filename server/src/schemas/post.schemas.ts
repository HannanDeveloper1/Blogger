import { z } from "zod";

export const createPostSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters"),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["draft", "published"]).default("draft"),
  visibility: z.enum(["private", "public"]).default("public"),
});

export const updatePostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200).optional(),
  content: z.string().min(1, "Content is required").optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  visibility: z.enum(["private", "public"]).default("public").optional(),
});

export const paginationSchema = z.object({
  page: z
    .string()
    .regex(/^[1-9]\d*$/, "Page must be a positive integer")
    .transform(Number)
    .default("1"),
  limit: z
    .string()
    .regex(/^[1-9]\d*$/, "Limit must be a positive integer")
    .transform(Number)
    .default("10"),
  status: z
    .enum(["draft", "published", "archived", "all"])
    .default("published"),
});
