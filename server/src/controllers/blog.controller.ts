import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import prisma from "../config/prisma";
import ErrorHandler from "../utils/errorHandler";

const DEFAULT_HTML_SANITIZE_OPTIONS = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "h1",
    "h2",
    "h3",
    "pre",
    "code",
    "blockquote",
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "title", "width", "height"],
    a: ["href", "name", "target"],
  },
};

export const createBlog = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user.id;
    const data = req.body;

    let post = await prisma.blog.findUnique({
      where: { title: data.title },
    });

    if (post) {
      next(
        new ErrorHandler(
          "A blog post with this title already exists. Please choose a unique title.",
          400
        )
      );
    }

    const rawHtml = await marked(data.content);
    const safeHtml = sanitizeHtml(rawHtml, DEFAULT_HTML_SANITIZE_OPTIONS);

    await prisma.blog.create({
      data: {
        author: { connect: { id: userId } },
        htmlCache: safeHtml,
        ...data,
      },
    });

    res.status(201).json({
      success: true,
      message: "Post created",
    });
  }
);
