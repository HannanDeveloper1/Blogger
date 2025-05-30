import { NextFunction, Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler.middleware";
import hashPassword from "../utils/hashPassword";
import prisma from "../config/prisma";
import ErrorHandler from "../utils/errorHandler";
import path from "path";
import ejs from "ejs";

import {
  generateAccessToken,
  issueRefreshToken,
  issueResetToken,
  revokeRefreshToken,
  verifyRefreshToken,
  verifyResetToken,
} from "../utils/tokens";
import env from "../config/env";
import bcrypt from "bcrypt";
import { sendMail } from "../utils/mailer";

const logoURL =
  "https://6g1otobb4c.ufs.sh/f/vAg46GzfkdIUSQHkJjw605Z8BcGjzxDL2fYspTIFeutdJw1k";

// User registration and login controllers
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

export const loginUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return next(new ErrorHandler("Invalid Credentials", 401));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password!);

    if (!isPasswordValid) {
      return next(new ErrorHandler("Invalid Credentials", 401));
    }

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
      .status(200)
      .json({
        success: true,
        accessToken,
      });
  }
);

// Token refresh controller
export const refreshToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.jid;

    if (!refreshToken) {
      return next(new ErrorHandler("No refresh token provided", 401));
    }

    const userId = await verifyRefreshToken(refreshToken);

    await revokeRefreshToken(refreshToken);

    const newTokenId = await issueRefreshToken(userId);
    const accessToken = generateAccessToken({ userId });

    res
      .cookie("jid", newTokenId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: parseInt(env.REFRESH_TOKEN_EXP_DAYS) * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        accessToken,
      });
  }
);

export const forgetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(new ErrorHandler("No Account found with this email!", 404));
    }

    const nonce = await issueResetToken(user.id);

    const resetUrl = `${env.CLIENT_ORIGIN}/reset-password?uid=${user.id}&token=${nonce}`;
    const templatePath = path.join(
      __dirname,
      "../templates/reset-password.ejs"
    );

    const html = await ejs.renderFile(templatePath, {
      name: user.name,
      logoURL,
      clientOrigin: env.CLIENT_ORIGIN,
      resetUrl,
      headers: {
        "X-Priority": "1 (Highest)",
        "X-MSMail-Priority": "High",
        Importance: "High",
        Precedence: "bulk", // signals a system-generated mail
      },
    });
    await sendMail({
      to: user.email,
      subject: "Reset your password",
      html,
      text: `Reset your password: ${resetUrl}`,
    });

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { uid, token } = req.query;
    const { newPassword } = req.body;

    // Validate query params
    if (typeof uid !== "string" || typeof token !== "string") {
      return next(new ErrorHandler("Missing uid or token in request", 400));
    }

    await verifyResetToken(uid, token);

    const user = await prisma.user.update({
      where: { id: uid },
      data: { password: await hashPassword(newPassword) },
    });

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });

    const supportUrl = `${env.CLIENT_ORIGIN}/support/account`;
    const templatePath = path.join(
      __dirname,
      "../templates/password-updated.ejs"
    );

    const html = await ejs.renderFile(templatePath, {
      name: user.name,
      logoURL,
      clientOrigin: env.CLIENT_ORIGIN,
      supportUrl,
      headers: {
        "X-Priority": "1 (Highest)",
        "X-MSMail-Priority": "High",
        Importance: "High",
        Precedence: "bulk", // signals a system-generated mail
      },
    });
    await sendMail({
      to: user.email,
      subject: "Password Updated Successfully",
      html,
      text: `Your password has been updated successfully. If you did not request this change, please contact support at ${supportUrl}`,
    });
  }
);
