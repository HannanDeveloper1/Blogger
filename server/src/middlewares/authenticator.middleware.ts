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
    });

    if (!user) {
      return next(new ErrorHandler("Unauthorized – user not found", 401));
    }

    req.user = user;
    return next();
  } catch (err: any) {
    return next(
      new ErrorHandler("Something went wrong, please try again.", 500)
    );
  }
};

export default authenticateMiddleware;
