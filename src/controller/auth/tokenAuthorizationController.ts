import { RequestHandler } from "express";
import { ExpressUser } from "../../types/globalTypes";
import { pigeonDb } from "../../database/dbClient";
import { wrapResponse } from "../../utils/responseWrapper";
import { LoginResponse } from "../../types/apiResponse";
import { LoggerApiError } from "../../errors/errors";

export const TokenAuthorizationController: RequestHandler = async (
  req,
  res,
  next
) => {
  const user = req.user as ExpressUser;
  try {
    const userData = await pigeonDb
      .selectFrom("User")
      .select(["User.id", "User.username", "User.email"])
      .innerJoin("Profile", "Profile.userId", "User.id")
      .where("userId", "=", user.id)
      .select("Profile.picture")
      .executeTakeFirstOrThrow();
    const responseObj = wrapResponse<Omit<LoginResponse, "accessToken">>({
      userId: userData.id,
      username: userData.username,
      email: userData.email,
      profilePicture: userData.picture,
    });
    res.json(responseObj);
  } catch (error) {
    return next(new LoggerApiError(error, 500));
  }
};
