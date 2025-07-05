import { RequestHandler } from "express";
import * as yup from "yup";
import { checkPostExist } from "../../lib/dbCommonQuery";
import { mainDb } from "../../database/dbClient";
import { BodyValidationError, ApiError, LoggerApiError } from "../../errors/errors";
import { aggregatedReactions, totalReactionCount } from "../../lib/dbQueryFraments";
import { CommentResponse } from "../../types/apiResponse";
import { ExpressUser } from "../../types/globalTypes";
import { wrapResponse } from "../../utils/responseWrapper";
import { formatDistanceToNow } from "date-fns";

const RetriveCommentSchema = yup.object().shape({
  postId: yup.number().required("post id is required"),
});

export const RetriveCommentsController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { postId } = RetriveCommentSchema.validateSync(req.body);
    const userId = (req.user as ExpressUser).id;

    if (!(await checkPostExist(postId)))
      return next(new ApiError(404, "post doesnt exist", true));

    const comments = await mainDb
      .selectFrom("comment")
      .leftJoin("reaction", (join) =>
        join
          .onRef("reaction.reaction_on_id", "=", "comment.comment_id")
          .on("reaction.reaction_on_type", "=", "comment")
      )
      .select([
        "comment.comment_id",
        "comment.comment_body",
        "comment.commenter_id",
        "comment.created_at",
        "comment.post_id",
        "comment.username",
        "comment.image_url",
        totalReactionCount(),
        aggregatedReactions(),
      ])
      .where("comment.post_id", "=", postId)
      .groupBy([
        "comment.comment_id",
        "comment.comment_body",
        "comment.commenter_id",
        "comment.created_at",
        "comment.post_id",
        "comment.username",
        "comment.image_url",
      ])
      .execute();

    const responseObjs = wrapResponse<CommentResponse[]>(
      comments.map((comment) => ({
        commentId: comment.comment_id,
        commentorId: userId,
        commentBody: comment.comment_body,
        postId: postId,
        createdAt: formatDistanceToNow(comment.created_at, { addSuffix: true }),
        username: comment.username,
        profilePicture: comment.image_url,
        totalReaction: comment.totalReaction,
        reactions: comment.reactions,
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
