import { RequestHandler } from "express";
import { PostSchemaValidation } from "../../validation/postValidation";
import {
  ApiError,
  BodyValidationError,
  isMongError,
  LoggerApiError,
} from "../../errors/errors";
import { COLLECTIONS, mongoClientDb } from "../../db/mongoClient/mongoClient";
import { defaultReactions } from "../../global/constants";
import { ValidationError } from "yup";
import { logger } from "../../logger/logger";
import { ExpressUser } from "../../types/global";
import { IPost } from "../../types/mongoClient";

export const CreatePostController: RequestHandler = async (req, res, next) => {
  try {
    const { content } = await PostSchemaValidation.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    const { id, ...user } = req.user as ExpressUser;
    const doc: IPost = {
      content,
      ...user,
      reactions: defaultReactions,
      userId: id,
      comments: [],
      createdAt: new Date(),
      reactionIds: [],
    };
    const response = await mongoClientDb
      .collection<IPost>(COLLECTIONS.POST)
      .insertOne(doc, { writeConcern: { w: "majority" } });
    res.json({
      data: { doc, _id: response.insertedId },
    });
  } catch (error) {
    if (error instanceof ValidationError)
      return next(new BodyValidationError(error.errors));
    else if (isMongError(error) && error.code === 64) {
      logger.error("Timeout for replica sets");
      return next(new ApiError(500));
    } else return next(new LoggerApiError(error, 500));
  }
};
