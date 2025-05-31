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
    const {
      thumbnail,
      title,
      description,
      content,
      status,
      visibility,
      tags, // array of string tag names
    } = req.body as {
      thumbnail: string;
      title: string;
      description?: string;
      content: string;
      status: "draft" | "published";
      visibility: "private" | "public";
      tags: string[];
    };

    // Check for unique title
    const existing = await prisma.blog.findUnique({
      where: { title },
    });
    if (existing) {
      return next(
        new ErrorHandler(
          "A blog post with this title already exists. Please choose a unique title.",
          400
        )
      );
    }

    // Convert Markdown → HTML, then sanitize
    const rawHtml = marked(content);
    const safeHtml = sanitizeHtml(
      rawHtml as string,
      DEFAULT_HTML_SANITIZE_OPTIONS
    );

    // Build nested create list for tags (through BlogTag)
    //    Each entry will create a BlogTag that connects to a Tag (connectOrCreate).
    const tagCreates = tags.map((tagName: string) => ({
      tag: {
        connectOrCreate: {
          where: { name: tagName },
          create: { name: tagName },
        },
      },
    }));

    // Creating the blog
    const blog = await prisma.blog.create({
      data: {
        thumbnail,
        title,
        description,
        content,
        htmlCache: safeHtml,
        status,
        visibility,
        author: {
          connect: { id: userId },
        },
        tags: {
          create: tagCreates,
        },
      },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Post created",
      data: {
        id: blog.id,
        title: blog.title,
        tags: blog.tags.map((bt) => bt.tag.name),
      },
    });
  }
);

export const getBlogs = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { page, limit, sort } = req.query as unknown as {
      page: number;
      limit: number;
      sort?: "asc" | "desc";
    };

    // Enforce maximum limit
    const take = Math.min(limit, 50);
    const skip = (page - 1) * take;

    const orderDirection = sort === "asc" ? "asc" : "desc";

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
            createdAt: orderDirection,
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
