import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import { BodyValidationError } from "../errors/errors";

export const requestBodyValidator: RequestHandler = (req, res, next) => {
  const validatedRequestBody = validationResult(req);
  if (!validatedRequestBody.isEmpty()) {
    return next(new BodyValidationError(validatedRequestBody.array()));
  }
};
