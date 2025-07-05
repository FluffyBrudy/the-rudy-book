import { RequestHandler } from "express";
import { mainDb } from "../../database/dbClient";
import { ApiError, LoggerApiError } from "../../errors/errors";
import { aggregatedReactions, totalReactionCount } from "../../lib/dbQueryFraments";
import { CommentResponse } from "../../types/apiResponse";
import { ExpressUser } from "../../types/globalTypes";
import { wrapResponse } from "../../utils/responseWrapper";
import { formatDistanceToNow } from "date-fns";
import { DB } from "../../types/db/maindb";
import { OperandValueExpression } from "kysely";

export const RetriveCommentController: RequestHandler = async (
  req,
  res,
  next
) => {
  const user = req.user as ExpressUser;
  const commentId = req.params?.commentId as unknown as
    | OperandValueExpression<DB, "comment", "comment.comment_id">
    | undefined;

  if (!commentId) return next(new ApiError(422, "invalid postId", true));
  try {
    const comment = await mainDb
      .selectFrom("comment")
      .leftJoin("reaction", (join) =>
        join
          .onRef("reaction.reaction_on_id", "=", "comment.comment_id")
          .on("reaction.reaction_on_type", "=", "comment")
      )
      .selectAll("comment")
      .select([totalReactionCount(), aggregatedReactions()])
      .where("comment.comment_id", "=", commentId)
      .groupBy([
        "comment.post_id",
        "comment.comment_id",
        "comment.username",
        "comment.image_url",
        "comment.created_at",
      ])
      .limit(1)
      .executeTakeFirst();
    if (!comment) return next(new ApiError(400, "comment not found", true));

    const response = wrapResponse<CommentResponse>({
      commentId: comment.comment_id,
      commentorId: comment.commenter_id,
      postId: comment.post_id,
      commentBody: comment.comment_body,
      createdAt: formatDistanceToNow(comment.created_at!, { addSuffix: true }),
      username: comment.username,
      profilePicture: comment.image_url,
      totalReaction: comment.totalReaction,
      reactions: comment.reactions,
    });
    res.json(response);
  } catch (error) {
    return next(new LoggerApiError(error, 500));
  }
};
