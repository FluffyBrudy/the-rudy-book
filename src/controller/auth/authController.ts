import { RequestHandler } from "express";
import yup, { ValidationError } from "yup";
import {
  MAX_PASSWORD_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from "../../constants/validation";
import {
  ApiError,
  BodyValidationError,
  LoggerApiError,
} from "../../errors/errors";
import { pigeonDb } from "../../database/dbClient";

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

const registerSchema = loginSchema.concat(
  yup.object().shape({
    username: yup
      .string()
      .required()
      .min(MIN_USERNAME_LENGTH)
      .max(MAX_USERNAME_LENGTH),
  })
);

export const registerControllerPost: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { username, email, password } = registerSchema.validateSync(req.body);
    const user = await pigeonDb
      .insertInto("User")
      .values({
        username,
        email,
        password,
      })
      .returning(["User.password", "User.email", "User.id"])
      .executeTakeFirst();
    if (!user) throw new ApiError(500, "something went wrong");
    res.json({ data: { ...user } });
  } catch (error) {
    if (error instanceof ValidationError) {
      return next(new BodyValidationError(error.errors));
    }
    return next(new LoggerApiError(error, 500));
  }
};
