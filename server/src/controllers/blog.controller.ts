import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware";
import { marked } from "marked";
import sanitizeHtml from "sanitize-html";
import prisma from "../config/prisma";
import ErrorHandler from "../utils/errorHandler";
import { Blog } from "../generated/prisma";

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
    const {
      page = 1,
      limit = 10,
      sort = "desc",
    } = req.query as unknown as {
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

export const getSingleBlog = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const currentUser = req.user as { id: string } | undefined;

    const blog = await prisma.blog.findUnique({
      where: { id: id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        likes: true,
        comments: true,
      },
    });

    if (!blog) {
      return next(new ErrorHandler("Blog not found", 404));
    }

    if (
      !(blog.status === "published" && blog.visibility === "public") &&
      (!currentUser || currentUser.id !== blog.authorId)
    ) {
      return next(new ErrorHandler("You cannot view this blog", 403));
    }

    const tags = blog.tags.map((bt) => bt.tag.name);

    return res.json({
      id: blog.id,
      thumbnail: blog.thumbnail,
      title: blog.title,
      description: blog.description,
      content: blog.content, // raw Markdown
      html: blog.htmlCache, // sanitized HTML
      visibility: blog.visibility,
      status: blog.status,
      authorId: blog.authorId,
      tags,
      likes: blog.likes,
      comments: blog.comments,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
    });
  }
);

export const updateBlog = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const blogId = req.params.id;
    const currentUser = (req as any).user as { id: string };

    const existing = await prisma.blog.findUnique({
      where: { id: blogId },
      include: {
        tags: {
          include: { tag: true },
        },
      },
    });

    if (!existing) {
      return next(new ErrorHandler("Blog not found", 404));
    }

    if (existing.authorId !== currentUser.id) {
      return next(new ErrorHandler("You cannot update this blog", 403));
    }

    // Destructure incoming fields (all are optional in update schema)
    const {
      thumbnail,
      title,
      description,
      content,
      status,
      visibility,
      tags, // string[] or undefined
    } = req.body as {
      thumbnail?: string;
      title?: string;
      description?: string;
      content?: string;
      status?: "draft" | "published" | "archived";
      visibility?: "private" | "public";
      tags?: string[];
    };

    // Build an object for fields to update
    const dataToUpdate: any = {};

    if (thumbnail !== undefined) dataToUpdate.thumbnail = thumbnail;
    if (title !== undefined) dataToUpdate.title = title;
    if (description !== undefined) dataToUpdate.description = description;
    if (status !== undefined) dataToUpdate.status = status;
    if (visibility !== undefined) dataToUpdate.visibility = visibility;

    // If content changed, re-render HTML and sanitize
    if (content !== undefined) {
      const rawHtml = await marked(content);
      const safeHtml = sanitizeHtml(rawHtml, DEFAULT_HTML_SANITIZE_OPTIONS);
      dataToUpdate.content = rawHtml;
      dataToUpdate.htmlCache = safeHtml;
    }

    // If tags array is provided, synchronize them:
    //    - Delete all existing BlogTag entries for this blog
    //    - Create new BlogTag entries for each tagName (connectOrCreate Tag)

    let tagSync: { deleteMany: { blogId: string }; create: any[] } | undefined;

    if (Array.isArray(tags)) {
      const tagCreates = tags.map((tag: string) => ({
        tag: {
          connectOrCreate: {
            where: { name: tag },
            create: { name: tag },
          },
        },
      }));

      tagSync = {
        deleteMany: { blogId },
        create: tagCreates,
      };
    }

    // Performing the update
    const updated = await prisma.blog.update({
      where: { id: blogId },
      data: {
        ...dataToUpdate,
        ...(tagSync
          ? {
              tags: {
                deleteMany: tagSync.deleteMany,
                create: tagSync.create,
              },
            }
          : {}),
      },
      include: {
        tags: { include: { tag: true } },
        likes: true,
        comments: true,
      },
    });

    return res.json({
      success: true,
      message: "Blog updated",
      data: {
        id: updated.id,
        thumbnail: updated.thumbnail,
        title: updated.title,
        description: updated.description,
        content: updated.content,
        html: updated.htmlCache,
        status: updated.status,
        visibility: updated.visibility,
        authorId: updated.authorId,
        tags: updated.tags.map((bt) => bt.tag.name),
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  }
);
