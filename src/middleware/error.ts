import { NextFunction, Request, Response } from "express";
import {
  ApiError,
  BodyValidationError,
  LoggerApiError,
} from "../errors/errors";

type ErrorRequestHandler = (
  err: ApiError | LoggerApiError | BodyValidationError,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

export const errorMiddleware = () => {
  const middleware: ErrorRequestHandler = (error, _, res, __) => {
    const { status, message } = error;
    res.status(status).json({ error: message });
  };
  return middleware;
};
