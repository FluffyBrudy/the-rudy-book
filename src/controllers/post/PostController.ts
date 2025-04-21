import { RequestHandler } from "express";
import { PostSchemaValidation } from "../../validation/postValidation";
import { logger } from "../../logger/logger";
import { ApiError, BodyValidationError } from "../../errors/errors";
import { ValidationError } from "yup";
import { mongoDbClient } from "../../db/mongoClient/mongoSchema";
import { MongooseError } from "mongoose";
import { ExpressUser } from "../../types/global";

export const CreatePostController: RequestHandler = async (req, res, next) => {
  try {
    const postValidation = await PostSchemaValidation.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    const { username, id, imageUrl } = req.user as ExpressUser;

    const post = new mongoDbClient.Post({
      ...postValidation,
      ...{ userId: id, username, imageUrl },
    });

    await post.save();
    res.json(post);
  } catch (err) {
    logger.error(err);
    if (err instanceof ValidationError)
      return next(new BodyValidationError(err.errors));
    else if (err instanceof MongooseError)
      return next(new BodyValidationError([err.message]));
    else return next(new ApiError(500));
  }
};
