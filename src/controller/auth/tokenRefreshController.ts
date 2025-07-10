import { RequestHandler } from "express";
import { JsonWebTokenError, sign as JWTSign, verify as JWTVerify } from "jsonwebtoken";
import { ExpressUser } from "../../types/globalTypes";
import { pigeonDb } from "../../database/dbClient";
import { wrapResponse } from "../../utils/responseWrapper";
import { LoginResponse } from "../../types/apiResponse";
import { ApiError, LoggerApiError } from "../../errors/errors";

export const TokenRefreshController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const token = req.signedCookies.refreshToken as unknown as string | undefined
    if (!token) {
      res.status(204).end()
      return;
    }
    const { id } = JWTVerify(
      token,
      process.env.JWT_REFRESH_SECRET!
    ) as ExpressUser;

    const user = await pigeonDb
      .selectFrom("User")
      .innerJoin("Profile", "Profile.userId", "User.id")
      .select(["User.id", "User.username", "User.email", "Profile.picture"])
      .where("User.id", "=", id)
      .executeTakeFirst();
    if (!user) return next(new ApiError(404, "user"));

    const accessToken = JWTSign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" }
    );

    const responseObj = wrapResponse<LoginResponse>({
      accessToken,
      userId: user.id,
      username: user.username,
      email: user.email,
      profilePicture: user.picture,
    });
    res.json(responseObj);
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      return next(new ApiError(500, "unable to refresh token", true))
    }
    return next(new LoggerApiError(error, 500));
  }
};
