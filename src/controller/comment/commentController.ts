import { RequestHandler } from "express";
import { DatabaseError } from "pg";
import * as yup from "yup";
import {
  EReactionOnTypes,
  MAX_COMMENT_LENGTH,
} from "../../constants/validation";
import { mainDb } from "../../database/dbClient";
import {
  ApiError,
  BodyValidationError,
  LoggerApiError,
} from "../../errors/errors";
import { checkPostExist, retrieveProfile } from "../../lib/dbCommonQuery";
import {
  aggregatedReactions,
  totalReactionCount,
} from "../../lib/dbQueryFraments";
import { CommentResponse } from "../../types/apiResponse";
import { ExpressUser } from "../../types/globalTypes";
import { wrapResponse } from "../../utils/responseWrapper";
import { logger } from "../../logger/logger";
import { sendNotification } from "../../lib/notificationSender";
import { formatDistanceToNow } from "date-fns";

const RetriveCommentSchema = yup.object().shape({
  postId: yup.number().required("post id is required"),
});
const CreateCommentSchema = yup
  .object()
  .shape({
    commentBody: yup
      .string()
      .required("comment content can not be empty")
      .trim()
      .min(1, "comment content can not be empty")
      .max(MAX_COMMENT_LENGTH),
  })
  .concat(RetriveCommentSchema);

export const CreateCommentController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { commentBody, postId } = CreateCommentSchema.validateSync(req.body);
    const { username, id } = req.user as ExpressUser;
    const userId = id;

    const userRes = await retrieveProfile<"picture">(userId);

    const comment = await mainDb
      .insertInto("comment")
      .values({
        commenter_id: userId,
        comment_body: commentBody,
        post_id: postId,
        username: username,
        image_url: userRes?.picture ?? "",
      })
      .returningAll()
      .executeTakeFirst();
    if (!comment)
      return next(new ApiError(500, "unable to create comment", true));

    const responseObj = wrapResponse<CommentResponse>({
      commentId: comment.comment_id,
      commentorId: userId,
      commentBody: comment.comment_body,
      postId: postId,
      createdAt: formatDistanceToNow(comment.created_at, { addSuffix: true }),
      username: comment.username,
      profilePicture: comment.image_url,
      totalReaction: 0,
      reactions: [],
    });

    res.status(201).json(responseObj);
    mainDb
      .selectFrom("post")
      .select("author_id")
      .where("post_id", "=", postId)
      .executeTakeFirst()
      .then((res) => {
        if (!res) return;
        const receiverId = res.author_id;
        sendNotification(
          receiverId,
          `${username} commented on your post`,
          postId,
          EReactionOnTypes.POST,
          req.headers.authorization!
        );
      })
      .catch((err) => logger.error(err));
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return next(new BodyValidationError(error.errors));
    }
    if (error instanceof DatabaseError && error.code === "23503") {
      return next(new ApiError(404, "post doesn't exist", true));
    }
    return next(new LoggerApiError(error, 500));
  }
};

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
