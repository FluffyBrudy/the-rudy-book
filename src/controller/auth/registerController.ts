import { RequestHandler } from "express";
import * as yup from "yup";
import { hashSync, genSaltSync } from "bcryptjs";
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
import { uploadDefaultProfileImage } from "../../utils/avatar";
import { wrapResponse } from "../../utils/responseWrapper";
import { DatabaseError } from "pg";

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

export const RegisterController: RequestHandler = async (req, res, next) => {
  try {
    const { username, email, password } = registerSchema.validateSync(
      req.body,
      { abortEarly: false }
    );
    let responseObjData: unknown;
    await pigeonDb.transaction().execute(async (trx) => {
      const imageUploadPromise = uploadDefaultProfileImage(username);

      const user = await trx
        .insertInto("User")
        .values({
          username,
          email,
          password: hashSync(password, genSaltSync(10)),
        })
        .returning("User.id")
        .executeTakeFirstOrThrow();
      const imageUploadResponse = await imageUploadPromise;
      if (imageUploadResponse) {
        const profile = await trx
          .insertInto("Profile")
          .values({
            userId: user.id,
            picture: imageUploadResponse,
          })
          .execute();
      }
      responseObjData = wrapResponse<null>(null);
    });
    res.json(responseObjData);
  } catch (error) {
    if (error instanceof yup.ValidationError)
      return next(new BodyValidationError(error.errors));
    if (error instanceof DatabaseError && error.code === "23505") {
      return next(
        new ApiError(409, "User with this email already exists", true)
      );
    }

    return next(new LoggerApiError(error, 500));
  }
};
