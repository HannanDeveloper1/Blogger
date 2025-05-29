import { NextFunction, Request } from "express";
import { ZodSchema } from "zod";
import ErrorHandler from "../utils/errorHandler";

export default function validateBody<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new ErrorHandler(result.error.errors[0].message, 400));
    }
    req.body = result.data as T["_output"];
    next();
  };
}
