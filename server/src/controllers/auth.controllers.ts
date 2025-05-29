import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware";
import hashPassword from "../utils/hashPassword";
import prisma from "../config/prisma";
import ErrorHandler from "../utils/errorHandler";
import { generateAccessToken, issueRefreshToken } from "../utils/tokens";
import env from "../config/env";

export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return next(new ErrorHandler("Email is already in use", 400));
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = await issueRefreshToken(user.id);

    // Set the refresh token as an HTTP-only cookie and send the access token in the response
    res
      .cookie("jid", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: parseInt(env.REFRESH_TOKEN_EXP_DAYS) * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        success: true,
        accessToken,
      });
  }
);
