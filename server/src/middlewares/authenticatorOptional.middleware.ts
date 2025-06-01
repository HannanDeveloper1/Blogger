import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma";

const authenticateMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.id) {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    req.user = user ?? undefined;
  }
  next();
};

export default authenticateMiddleware;
