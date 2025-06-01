import { z } from "zod";

export const createBlogSchema = z.object({
  thumbnail: z.string().url().min(1, "Please upload the thumbnail"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .max(250, "Description cannot exceed 250 characters")
    .optional(),
  content: z.string().min(1, "Content is required"),
  status: z.enum(["draft", "published"]).default("draft"),
  visibility: z.enum(["private", "public"]).default("public"),
  tags: z.array(z.string()).optional().default([]),
});

export const updateBlogSchema = z.object({
  thumbnail: z.string().url().optional(),
  description: z
    .string()
    .max(250, "Description cannot exceed 250 characters")
    .optional(),
  title: z.string().max(200).optional(),
  content: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  visibility: z.enum(["private", "public"]).default("public").optional(),
  tags: z.array(z.string()).optional().default([]),
});

export const paginationSchema = z.object({
  page: z
    .string()
    .regex(/^[1-9]\d*$/, "Page must be a positive integer")
    .default("1")
    .transform(Number)
    .optional(),
  limit: z
    .string()
    .regex(/^[1-9]\d*$/, "Limit must be a positive integer")
    .default("10")
    .transform(Number)
    .optional(),
  sort: z
    .enum([
      "desc", // descending by creation date
      "asc", // ascending by creation date
    ])
    .default("desc")
    .optional(),
});

export const singleBlogSchema = z.object({
  id: z.string().min(1, "Please enter the id"),
});

export const userBlogsSchema = z.object({
  page: z
    .string()
    .regex(/^[1-9]\d*$/, "Page must be a positive integer")
    .default("1")
    .transform(Number)
    .optional(),
  limit: z
    .string()
    .regex(/^[1-9]\d*$/, "Limit must be a positive integer")
    .default("10")
    .transform(Number)
    .optional(),
  sort: z
    .enum([
      "desc", // descending by creation date
      "asc", // ascending by creation date
    ])
    .default("desc")
    .optional(),
  status: z
    .enum(["draft", "published", "archived"])
    .default("published")
    .optional(),
  Visibility: z.enum(["all", "public", "private"]).default("all").optional(),
});
