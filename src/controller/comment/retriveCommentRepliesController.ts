import { RequestHandler } from "express";
import * as yup from "yup";
import { mainDb } from "../../database/dbClient";
import { BodyValidationError, LoggerApiError, ApiError } from "../../errors/errors";
import { aggregatedReactions, totalReactionCount } from "../../lib/dbQueryFraments";
import { wrapResponse } from "../../utils/responseWrapper";
import { CommentReplyResponse } from "../../types/apiResponse";
import { formatDistanceToNow } from "date-fns";

const ReplyRetriveSchema = yup.object().shape({
  parentCommentId: yup.number().required("comment id is required"),
});

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
        createdAt: formatDistanceToNow(reply.created_at, { addSuffix: true }),
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
