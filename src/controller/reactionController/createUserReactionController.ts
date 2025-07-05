import { RequestHandler } from "express";
import * as yup from "yup";
import { EReactionOnTypes, EReactionTypes } from "../../constants/validation";
import { ExpressUser } from "../../types/globalTypes";
import { mainDb, pigeonDb } from "../../database/dbClient";
import {
  ApiError,
  BodyValidationError,
  LoggerApiError,
} from "../../errors/errors";
import { wrapResponse } from "../../utils/responseWrapper";
import {
  ReactionResponse,
  UndoReactionResponse,
} from "../../types/apiResponse";
import { DatabaseError } from "pg";
import { checkTargetExist } from "../../lib/dbCommonQuery";
import { sendNotification } from "../../lib/notificationSender";
import { sql } from "kysely";

const UserReactionSchema = yup.object().shape({
  reactionOnId: yup.number().required("reaction target is required"),
  reactionOnType: yup
    .string()
    .required("reaction on type(Post, Comment, Reply) is required")
    .oneOf(Object.values(EReactionOnTypes)),
  reactionType: yup
    .string()
    .required("reaction type is required")
    .oneOf(Object.values(EReactionTypes)),
});

export const CreateUserReactionController: RequestHandler = async (
  req,
  res,
  next
) => {
  const user = req.user as ExpressUser;
  try {
    const { reactionOnId, reactionOnType, reactionType } =
      UserReactionSchema.validateSync(req.body);

    const [targetAuthor, image] = await Promise.all([
      checkTargetExist(reactionOnType, reactionOnId),
      pigeonDb
        .selectFrom("Profile")
        .select("Profile.picture")
        .where("userId", "=", user.id)
        .executeTakeFirst()!,
    ]);
    if (!targetAuthor)
      return next(new ApiError(404, `${reactionOnType} doesnt exist`, true));

    const queryResponse = await sql<IHandReactionFunction>`
        SELECT * FROM toggle_reaction(
          ${user.id},
          ${reactionOnType},
          ${reactionOnId},
          ${reactionType},
          ${image?.picture},
          ${user.username}
        )
      `.execute(mainDb);

    const { toggle_reaction } = queryResponse.rows[0];
    const { action, reaction } = toggle_reaction;

    if (reaction === null) {
      const responseObj = wrapResponse<UndoReactionResponse>({
        undo: true,
        reactionOnId: reactionOnId,
        reactorId: user.id,
        action: action,
      });

      res.status(200).json(responseObj);
      return;
    }
    const responseObj = wrapResponse<ReactionResponse>({
      profilePicture: image!.picture,
      reactionOnId: reaction.reaction_on_id,
      reactionOnType: reaction.reaction_on_type,
      reactionType: reaction.reaction_type,
      reactorTd: reaction.reactor_id,
      username: reaction.username,
      action: action,
    });
    res.status(201).json(responseObj);

    sendNotification(
      targetAuthor,
      `${user.username} reacted on your ${reactionOnType.toLocaleLowerCase()}`,
      reactionOnId,
      reactionOnType,
      req.headers.authorization!
    )
      .then()
      .catch();
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return next(new BodyValidationError(error.errors));
    }
    if (error instanceof DatabaseError && error.code === "23503") {
      return next(new ApiError(404, `target doesn't doesnt exist`));
    } else {
      return next(new LoggerApiError(error, 500));
    }
  }
};

interface IHandReactionFunction {
  toggle_reaction: {
    action: "inserted" | "removed" | "toggled";
    reaction: {
      reactor_id: string;
      reaction_on_type: string;
      reaction_on_id: number;
      reaction_type: string;
      image_url: string;
      username: string;
    };
  };
}
