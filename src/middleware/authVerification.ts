import passport from "passport";
import { ApiError } from "../errors/errors";
import { ExpressUser } from "../types/globalTypes";
import { RequestHandler } from "express";

export const verifyAuth = () => {
  const handler: RequestHandler = (req, res, next) => {
    return passport.authenticate(
      "jwt",
      { session: false },
      (
        err: ApiError,
        user: ExpressUser,
        info: { message: string; code: number }
      ) => {
        if (err) return next(err);
        if (!user) {
          return next(new ApiError(401, "User"));
        }
        next();
      }
    )(req, res, next);
  };
  return handler;
};
