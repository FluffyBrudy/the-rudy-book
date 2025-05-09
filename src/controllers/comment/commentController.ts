import { RequestHandler } from "express";
import { ValidationError } from "yup";
import { COLLECTIONS, mongoClientDb } from "../../db/mongoClient/mongoClient";
import {
  ApiError,
  BodyValidationError,
  isMongError,
  LoggerApiError,
} from "../../errors/errors";
import { defaultReactions } from "../../global/constants";
import { logger } from "../../logger/logger";
import { ExpressUser } from "../../types/global";
import { IComment } from "../../types/mongoClient";
import { CommentSchemaValidation } from "../../validation/commentValidation";
import { ObjectId } from "mongodb";

export const CreateCommentController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { postId, parentCommentId, content } =
      await CommentSchemaValidation.validate(req, {
        abortEarly: false,
        stripUnknown: true,
      });
    const { id, ...user } = req.user as ExpressUser;

    const parentId = parentCommentId ? { parentCommentId } : {};

    const doc: IComment = {
      postId,
      content,
      ...user,
      ...parentId,
      userId: id,
      reactions: defaultReactions,
      createdAt: new Date(),
      updatedAt: new Date(),
      replies: [],
    };

    const postExist = await mongoClientDb
      .collection(COLLECTIONS.POST)
      .findOne({ _id: new ObjectId(postId) });

    if (!postExist) return next(new ApiError(422));

    const inserted = await mongoClientDb
      .collection<IComment>(COLLECTIONS.COMMENT)
      .insertOne(doc, { writeConcern: { w: "majority" } });

    res.json({ data: { _id: inserted.insertedId, ...doc } });
  } catch (error) {
    if (error instanceof ValidationError) {
      return next(new BodyValidationError(error.errors));
    }

    if (isMongError(error) && error.code === 64) {
      logger.error("Timeout for replica sets");
      return next(new ApiError(500));
    }

    return next(new LoggerApiError(error, 500));
  }
};
