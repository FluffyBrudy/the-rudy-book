import { RequestHandler } from "express";
import { sign as JWTSign, verify as JWTVerify } from "jsonwebtoken";
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
    const token = req.cookies["refreshToken"] as string | undefined;
    if (!token) return next(new ApiError(400));
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
    const refreshToken = JWTSign(
      { id: user.id, username: user.username },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      signed: true,
      sameSite: "none",
      partitioned: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const responseObj = wrapResponse<LoginResponse>({
      accessToken,
      userId: user.id,
      username: user.username,
      email: user.email,
      profilePicture: user.picture,
    });
    res.json(responseObj);
  } catch (error) {
    new LoggerApiError(error, 500);
  }
};
