import { NextFunction, Request, RequestHandler, Response } from "express";
import ErrorHandler from "../utils/errorHandler";
import { ZodTypeAny } from "zod";

export default function validateQuery<T extends ZodTypeAny>(
  schema: T
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log(req.query);
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(new ErrorHandler(result.error.errors[0].message, 400));
    }
    Object.assign(req.query, result.data);
    next();
  };
}
