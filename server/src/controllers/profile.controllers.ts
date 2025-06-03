import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware";
import prisma from "../config/prisma";
import ErrorHandler from "../utils/errorHandler";
import { SocialPlatform } from "../generated/prisma";

export const getMyProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const currentUser = (req as any).user as { id: string };
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        email: true,
        username: true,
        avatar: true,
        name: true,
        about: true,
        location: true,
        website: true,
        socialLinks: true,
        isVerified: true,
        accountStatus: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    return res.json({
      success: true,
      data: user,
    });
  }
);

export const updateMyProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const currentUser = (req as any).user as { id: string };
    const {
      name,
      username,
      about,
      location,
      website,
      socialLinks,
      avatar,
      phone,
    } = req.body as {
      name?: string;
      about?: string;
      username?: string;
      location?: {
        city: string;
        postalCode: string;
        street: string[];
        country: string;
      };
      website?: string;
      socialLinks?: {
        platform: string;
        url: string;
      }[];
      avatar?: string;
      phone?: string;
    };
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        ...(name !== undefined && { name }),
        ...(username !== undefined && { username }),
        ...(about !== undefined && { about }),
        ...(website !== undefined && { website }),
        ...(avatar !== undefined && { avatar }),
        ...(phone !== undefined && { phone }),
        ...(location !== undefined && { location }), // Prisma will store JSON automatically
      },
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
        isVerified: true,
        accountStatus: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (Array.isArray(socialLinks)) {
      await prisma.socialLink.deleteMany({
        where: { userId: currentUser.id },
      });

      // Create new
      const createData = socialLinks.map((link) => ({
        userId: currentUser.id,
        platform: link.platform as SocialPlatform,
        url: link.url,
      }));
      await prisma.socialLink.createMany({
        data: createData,
        skipDuplicates: true,
      });
    }

    const updatedLinks = await prisma.socialLink.findMany({
      where: { userId: currentUser.id },
      select: { platform: true, url: true },
    });

    return res.json({
      success: true,
      data: {
        ...updatedUser,
        socialLinks: updatedLinks,
      },
    });
  }
);
