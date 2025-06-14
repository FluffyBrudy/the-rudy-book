import { RequestHandler } from "express";
import { DatabaseError } from "pg";
import * as yup from "yup";
import { EReactionOnTypes } from "../../constants/validation";
import { mainDb } from "../../database/dbClient";
import {
  ApiError,
  BodyValidationError,
  LoggerApiError,
} from "../../errors/errors";
import { retrieveProfile } from "../../lib/dbCommonQuery";
import {
  aggregatedReactions,
  totalReactionCount,
} from "../../lib/dbQueryFraments";
import { sendNotification } from "../../lib/notificationSender";
import { logger } from "../../logger/logger";
import { CommentReplyResponse } from "../../types/apiResponse";
import { ExpressUser } from "../../types/globalTypes";
import { wrapResponse } from "../../utils/responseWrapper";

const ReplyRetriveSchema = yup.object().shape({
  parentCommentId: yup.number().required("comment id is required"),
});

const CommentReplySchema = yup
  .object()
  .shape({
    replyContent: yup
      .string()
      .required("reply must not be empty")
      .trim()
      .min(1, "reply must not be empty"),
  })
  .concat(ReplyRetriveSchema);

export const CreateCommentReplyController: RequestHandler = async (
  req,
  res,
  next
) => {
  const user = req.user as ExpressUser; // replied_by_id
  try {
    const { parentCommentId, replyContent } = CommentReplySchema.validateSync(
      req.body
    );

    const profile = await retrieveProfile<"picture">(user.id);
    const commentReply = await mainDb
      .insertInto("comment_reply")
      .values({
        parent_comment_id: parentCommentId, // again im notchecking because error come from db for fkey violation if comment doesnt exist
        replied_by_id: user.id,
        reply_content: replyContent,
        username: user.username,
        image_url: profile?.picture ?? "",
      })
      .returningAll()
      .executeTakeFirst();

    if (!commentReply)
      return next(new ApiError(500, "unable to create reply", true));

    const responseObj = wrapResponse<CommentReplyResponse>({
      commentReplyId: commentReply.comment_reply_id,
      createdAt: commentReply.created_at,
      profilePicture: commentReply.image_url,
      parentCommentId: commentReply.parent_comment_id,
      repliedById: commentReply.replied_by_id,
      replyContent: commentReply.reply_content,
      updatedAt: commentReply.udpated_at,
      username: user.username,
      totalReaction: 0,
      reactions: [],
    });
    res.status(201).json(responseObj);

    mainDb
      .selectFrom("comment")
      .where("comment_id", "=", parentCommentId)
      .select("commenter_id")
      .executeTakeFirstOrThrow()
      .then((res) => {
        const notificationMsg = `${user.username} replied to your comment`;
        const receiverId = res.commenter_id;
        sendNotification(
          receiverId,
          notificationMsg,
          parentCommentId,
          EReactionOnTypes.COMMENT,
          req.headers.authorization!
        );
      })
      .catch((err) => logger.error(err));
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return next(new BodyValidationError(error.errors));
    }
    if (error instanceof DatabaseError && error.code === "23503") {
      return next(new ApiError(404, "comment doesnt exist", true));
    }
    return next(new LoggerApiError(error, 500));
  }
};

export const RetriveCommentRepliesController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { parentCommentId } = ReplyRetriveSchema.validateSync(req.body);

    const replies = await mainDb
      .selectFrom("comment_reply")
      .leftJoin("reaction", (join) =>
        join
          .onRef(
            "reaction.reaction_on_id",
            "=",
            "comment_reply.comment_reply_id"
          )
          .on("reaction.reaction_on_type", "=", "reply")
      )
      .selectAll("comment_reply")
      .select([totalReactionCount(), aggregatedReactions()])
      .where("comment_reply.parent_comment_id", "=", parentCommentId)
      .groupBy([
        "comment_reply.comment_reply_id",
        "comment_reply.created_at",
        "comment_reply.udpated_at",
        "comment_reply.image_url",
        "comment_reply.username",
        "comment_reply.replied_by_id",
        "comment_reply.parent_comment_id",
        "comment_reply.reply_content",
      ])
      .orderBy("created_at", "desc")
      .execute();

    const responseObjs = wrapResponse<CommentReplyResponse[]>(
      replies.map((reply) => ({
        commentReplyId: reply.comment_reply_id,
        createdAt: reply.created_at,
        profilePicture: reply.image_url ?? "",
        parentCommentId: reply.parent_comment_id,
        repliedById: reply.replied_by_id,
        replyContent: reply.reply_content,
        updatedAt: reply.udpated_at,
        username: reply.username ?? "",
        totalReaction: reply.totalReaction,
        reactions: reply.reactions,
      }))
    );
    res.status(200).json(responseObjs);
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return next(new BodyValidationError(error.errors));
    }
    return next(new LoggerApiError(error, 500));
  }
};
