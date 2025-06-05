import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma";
import ErrorHandler from "../utils/errorHandler";

const authenticateMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const partial = req.user as { id: string } | undefined;
  if (!partial?.id) {
    return next(new ErrorHandler("Unauthorized User", 401));
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: partial.id },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        name: true,
        about: true,
        location: true,
        website: true,
        phone: true,
        socialLinks: {
          select: {
            platform: true,
            url: true,
          },
        },
        isVerified: true,
        accountStatus: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return next(new ErrorHandler("Unauthorized – user not found", 401));
    }

    (req as AuthenticatedRequest).user = {
      id: user.id,
      email: user.email,
      username: user.username,
      avatar: user.avatar,
      name: user.name,
      about: user.about,
      location: user.location,
      website: user.website,
      phone: user.phone,
      socialLinks: user.socialLinks.map((link) => ({
        platform: link.platform,
        url: link.url,
      })),
      isVerified: user.isVerified,
      accountStatus: user.accountStatus,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return next();
  } catch (err: any) {
    return next(
      new ErrorHandler("Something went wrong, please try again.", 500)
    );
  }
};

export default authenticateMiddleware;
