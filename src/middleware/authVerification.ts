import { RequestHandler } from "express";
import passport from "passport";
import { ApiError } from "../errors/errors";
import { ExpressUser } from "../types/global";

export const verifyAuth = () => {
  const middleware: RequestHandler = (req, res, next) => {
    return passport.authenticate(
      "jwt",
      { session: false },
      (err: ApiError, user: ExpressUser) => {
        if (err) return next(err);
        if (!user) {
          return next(new ApiError(401, "User"));
        }
        req.user = user;
        next();
      }
    )(req, res, next);
  };
  return middleware;
};
