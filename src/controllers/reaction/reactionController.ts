import { RequestHandler } from "express";
import { MongoError, ObjectId } from "mongodb";
import { ValidationError } from "yup";
import {
  COLLECTIONS,
  mongoClientDb,
  performTransection,
} from "../../db/mongoClient/mongoClient";
import {
  ApiError,
  BodyValidationError,
  LoggerApiError,
} from "../../errors/errors";
import { ExpressUser } from "../../types/global";
import { IPost, IReaction } from "../../types/mongoClient";
import { UserReactionValidation } from "../../validation/reactionValidation";
import { UNPROCESSABLE_ENTITY_ERROR } from "../../global/errorMessage";

export const CreateReactionController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { targetType, targetId, reactionType } =
      await UserReactionValidation.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
    const userId = (req.user as ExpressUser).id;
    const doc = { targetId, reactionType, targetType, userId };

    const response = await performTransection(async (session) => {
      const dataExist = await mongoClientDb
        .collection(targetType)
        .findOne({ _id: new ObjectId(targetId) }, { session: session });
      if (!dataExist)
        throw new MongoError(targetType + " doesnt exist", {
          cause: Error(UNPROCESSABLE_ENTITY_ERROR),
        });

      const { insertedId } = await mongoClientDb
        .collection<IReaction>(COLLECTIONS.USER_REACTION)
        .insertOne(doc, { session: session });

      await mongoClientDb
        .collection<IPost>(COLLECTIONS.POST)
        .updateOne(
          { _id: new ObjectId(targetId) },
          { $push: { reactionIds: insertedId } },
          { session: session }
        );
    });
    if (response.success) {
      res.json({ data: { ...doc } });
    } else if (response.cause === UNPROCESSABLE_ENTITY_ERROR) {
      return next(new ApiError(422, `${targetType} doesnt exist`, true));
    } else {
      return next(new ApiError(500));
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      return next(new BodyValidationError(error.errors));
    } else {
      return next(new LoggerApiError(error, 500));
    }
  }
};
