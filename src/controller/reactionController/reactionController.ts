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

    const [targeExists, image] = await Promise.all([
      checkTargetExist(reactionOnType, reactionOnId),
      pigeonDb
        .selectFrom("Profile")
        .select("Profile.picture")
        .where("userId", "=", user.id)
        .executeTakeFirst()!,
    ]);
    if (!targeExists)
      return next(new ApiError(404, `${reactionOnType} doesnt exist`, true));

    const reaction = await mainDb
      .insertInto("reaction")
      .values({
        reaction_on_id: reactionOnId,
        reactor_id: user.id,
        reaction_on_type: reactionOnType,
        username: user.username,
        image_url: image?.picture ?? "",
        reaction_type: reactionType,
      })
      .returningAll()
      .executeTakeFirst();

    if (!reaction) return next(new ApiError(500, "reaction failed", true));

    const responseObj = wrapResponse<ReactionResponse>({
      profilePicture: reaction.image_url,
      reactionOnId: reaction.reaction_on_id,
      reactionOnType: reaction.reaction_on_type,
      reactionType: reaction.reaction_type,
      reactorTd: reaction.reactor_id,
      username: reaction.username,
    });
    res.status(201).json(responseObj);
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return next(new BodyValidationError(error.errors));
    }
    if (error instanceof DatabaseError && error.code === "23503") {
      return next(new ApiError(404, `target doesn't doesnt exist`));
    }
    if (error instanceof DatabaseError && error.code === "23505") {
      const deleteResponse = await mainDb
        .deleteFrom("reaction")
        .where("reaction.reactor_id", "=", user.id)
        .where("reaction.reaction_on_id", "=", req.body["reactionOnId"])
        .executeTakeFirst();
      if (!deleteResponse) {
        return next(new ApiError(500, "unable to remove reaction", true));
      }
      const response = wrapResponse<UndoReactionResponse>({
        undo: true,
        reactionOnId: req.body["reactionOnId"],
        reactorId: req.body["reactionId"],
      });
      res.status(200).json(response);
    } else {
      return next(new LoggerApiError(error, 500));
    }
  }
};

async function checkTargetExist(
  reactionOnType: EReactionOnTypes,
  targetId: number
) {
  switch (reactionOnType) {
    case EReactionOnTypes.COMMENT:
      const commentExists = await mainDb
        .selectFrom("comment")
        .select(sql`1`.as("dummy"))
        .where("comment.comment_id", "=", targetId)
        .executeTakeFirst();
      return !!commentExists;
    case EReactionOnTypes.POST:
      const postExists = await mainDb
        .selectFrom("post")
        .select(sql`1`.as("dummy"))
        .where("post.post_id", "=", targetId)
        .executeTakeFirst();
      return !!postExists;
    case EReactionOnTypes.REPLY:
      const replyExists = await mainDb
        .selectFrom("comment_reply")
        .select(sql`1`.as("dummy"))
        .where("comment_reply.comment_reply_id", "=", targetId)
        .executeTakeFirst();
      return !!replyExists;
    default:
      return false;
  }
}
