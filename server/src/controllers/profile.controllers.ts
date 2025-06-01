import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware";
import prisma from "../config/prisma";
import ErrorHandler from "../utils/errorHandler";

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
