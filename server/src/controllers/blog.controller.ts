import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import prisma from "../config/prisma";
import ErrorHandler from "../utils/errorHandler";
import {} from "../generated/prisma";

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

export const getBlogs = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page, limit, sort } = req.query as unknown as {
      page: number;
      limit: number;
      sort: "asc" | "desc";
    };

    const take = Math.min(limit, 50);
    const skip = (page - 1) * take;

    const [totalCount, rawPosts] = await Promise.all([
      prisma.blog.count({
        where: { status: "published", visibility: "public" },
      }),
      prisma.blog.findMany({
        where: { status: "published", visibility: "public" },
        skip,
        take,
        orderBy: [
          {
            createdAt: sort,
          },
        ],
        select: {
          id: true,
          thumbnail: true,
          title: true,
          description: true,
          htmlCache: true,
          visibility: true,
          authorId: true,
          createdAt: true,
          updatedAt: true,
          likes: true,
        },
      }),
    ]);
    const posts = rawPosts.map((p) => ({
      id: p.id,
      thumbnail: p.thumbnail,
      title: p.title,
      description: p.description,
      html: p.htmlCache,
      visibility: p.visibility,
      authorId: p.authorId,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      likesCount: p.likes.length,
    }));

    return res.json({
      data: posts,
      meta: {
        total: totalCount,
        page,
        limit: take,
        pages: Math.ceil(totalCount / take),
      },
    });
  }
);
