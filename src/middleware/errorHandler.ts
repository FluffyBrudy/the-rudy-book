import { NextFunction, Request, Response } from "express";
import { ApiError, LoggerApiError } from "../errors/errors";

type RequestHandler = (
  err: ApiError | LoggerApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => void;

export const errorHandler = () => {
  const middleware: RequestHandler = (error, req, res, next) => {
    console.log(error);
    res.status(error.status).json({ error: error.message, success: false });
  };
  return middleware;
};
