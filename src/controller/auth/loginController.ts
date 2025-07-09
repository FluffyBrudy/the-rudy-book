import { RequestHandler } from "express";
import * as yup from "yup";
import { compareSync } from "bcryptjs";
import { sign as JWTSign } from "jsonwebtoken";
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "../../constants/validation";
import {
  BodyValidationError,
  LoggerApiError,
  ApiError,
} from "../../errors/errors";
import { pigeonDb } from "../../database/dbClient";
import { wrapResponse } from "../../utils/responseWrapper";
import { LoginResponse } from "../../types/apiResponse";

const loginSchema = yup.object().shape({
  email: yup.string().required().email("use proper email format"),
  password: yup
    .string()
    .required()
    .trim()
    .min(MIN_PASSWORD_LENGTH)
    .max(MAX_PASSWORD_LENGTH)
    .matches(/[a-z]/, "must contain at least one lowercase letter")
    .matches(/[A-Z]/, "must contain at least one uppercase letter")
    .matches(/[0-9]/, "must contain at least one number")
    .matches(/^\S*$/, "password must not contain any space"),
});

export const LoginController: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.validateSync(req.body);
    const user = await pigeonDb
      .selectFrom("User")
      .innerJoin("Profile", "Profile.userId", "User.id")
      .select(["User.id", "User.password", "User.username", "Profile.picture"])
      .where("User.email", "=", email)
      .executeTakeFirst();
    if (!user) return next(new ApiError(404, "user"));

    const comaprePassword = compareSync(password, user.password);
    if (!comaprePassword)
      return next(new ApiError(401, "invalid password", true));
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
      path: "/"
    });

    const responseObj = wrapResponse<LoginResponse>({
      accessToken,
      userId: user.id,
      username: user.username,
      email: email,
      profilePicture: user.picture,
    });
    res.json(responseObj);
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return next(new BodyValidationError(error.errors));
    }
    return next(new LoggerApiError(error, 500));
  }
};
