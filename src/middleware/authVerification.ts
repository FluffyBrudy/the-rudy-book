import { RequestHandler } from "express";
import passport from "passport";
import { ApiError, LoggerApiError } from "../errors/errors";
import { ExpressUser } from "../types/global";

export const verifyAuth: RequestHandler = (req, res, next) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: ApiError | LoggerApiError, user: ExpressUser) => {
      if (err) {
        return next(new LoggerApiError(err, 401));
      }
      if (!user) {
        return next(new ApiError(401));
      }
      req.user = user;
      next();
    }
  )(req, res, next);
};
