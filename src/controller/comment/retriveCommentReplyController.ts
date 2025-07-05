import { RequestHandler } from "express";
import { mainDb } from "../../database/dbClient";
import { ApiError, LoggerApiError } from "../../errors/errors";
import { aggregatedReactions, totalReactionCount } from "../../lib/dbQueryFraments";
import { wrapResponse } from "../../utils/responseWrapper";
import { CommentReplyResponse } from "../../types/apiResponse";
import { formatDistanceToNow } from "date-fns";
import { DB } from "../../types/db/maindb";
import { OperandValueExpression } from "kysely";
import { ExpressUser } from "../../types/globalTypes";

export const RetriveCommentReplyController: RequestHandler = async (
  req,
  res,
  next
) => {
  const user = req.user as ExpressUser;

  const commentReplyId = req.params
    ?.commentReplyId as unknown as OperandValueExpression<
    DB,
    "comment_reply",
    "comment_reply_id"
  >;
  if (!commentReplyId) return next(new ApiError(422, "invalid reply id", true));
  try {
    const reply = await mainDb
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
      .innerJoin(
        "comment",
        "comment.comment_id",
        "comment_reply.parent_comment_id"
      )
      .selectAll("comment_reply")
      .select("comment.post_id")
      .select([totalReactionCount(), aggregatedReactions()])
      .where("comment_reply.comment_reply_id", "=", commentReplyId)
      .groupBy([
        "comment_reply.parent_comment_id",
        "comment_reply.comment_reply_id",
        "comment_reply.username",
        "comment_reply.image_url",
        "comment_reply.created_at",
        "comment.post_id",
      ])
      .limit(1)
      .executeTakeFirst();
    if (!reply) return next(new ApiError(404, "comment not found", true));

    const response = wrapResponse<CommentReplyResponse>({
      commentReplyId: reply.comment_reply_id,
      repliedById: reply.replied_by_id,
      postId: reply.post_id,
      replyContent: reply.reply_content,
      createdAt: formatDistanceToNow(reply.created_at!, { addSuffix: true }),
      username: reply.username,
      profilePicture: reply.image_url,
      totalReaction: reply.totalReaction,
      reactions: reply.reactions,
      parentCommentId: reply.parent_comment_id,
    });
    res.json(response);
  } catch (error) {
    return next(new LoggerApiError(error, 500));
  }
};
