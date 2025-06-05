import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma";

const authenticateMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.id) {
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: {
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
      }, });
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
    }; ?? undefined;
  }
  next();
};

export default authenticateMiddleware;
