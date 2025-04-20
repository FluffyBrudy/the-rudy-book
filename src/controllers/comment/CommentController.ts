import { RequestHandler } from "express";
import { CommentSchemaValidation } from "../../validation/commentValidation";
import { logger } from "../../logger/logger";
import { ValidationError as YupValidationError } from "yup";
import { ApiError, BodyValidationError } from "../../errors/errors";
import { MongooseError } from "mongoose";
import { mongoDbClient } from "../../db/mongoClient/mongoSchema";

export const CreateCommentController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    console.log(req.body["userId"]);
    const commentValidation = await CommentSchemaValidation.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    console.log(commentValidation);
    const session = await mongoDbClient.Comment.startSession();
    try {
      await session.withTransaction(async () => {
        const comment = await mongoDbClient.Comment.create({
          ...commentValidation,
        });
        await mongoDbClient.Post.updateOne(
          { _id: comment.postId },
          { $push: { comments: comment._id } }
        );
        res.json({ data: comment.toObject({ getters: true }) });
      });
    } catch (error) {
      const err = error as MongooseError;
      return next(new BodyValidationError([err.message]));
    }
  } catch (err) {
    logger.error(err);
    if (err instanceof YupValidationError)
      return next(new BodyValidationError(err.errors));
    else if (err instanceof MongooseError) return next([err.message]);
    else return next(new ApiError(500));
  }
};
