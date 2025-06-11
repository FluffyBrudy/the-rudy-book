import { RequestHandler } from "express";
import * as yup from "yup";
import { ExpressUser } from "../../types/globalTypes";
import {
  ApiError,
  BodyValidationError,
  LoggerApiError,
} from "../../errors/errors";
import { DatabaseError } from "pg";
import { mainDb, pigeonDb } from "../../database/dbClient";
import { wrapResponse } from "../../utils/responseWrapper";
import { CommentReplyResponse } from "../../types/apiResponse";

const CommentReplySchema = yup.object().shape({
  parentCommentId: yup.number().required("comment id is required"),
  replyContent: yup
    .string()
    .required("reply must not be empty")
    .trim()
    .min(1, "reply must not be empty"),
});
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

    const { picture } = (await pigeonDb
      .selectFrom("Profile")
      .select("Profile.picture")
      .where("userId", "=", user.id)
      .executeTakeFirst())!; // because this wouldnt be possible if user wouldnt exist
    const commentReply = await mainDb
      .insertInto("comment_reply")
      .values({
        parent_comment_id: parentCommentId, // again im notchecking because error come from db for fkey violation if comment doesnt exist
        replied_by_id: user.id,
        reply_content: replyContent,
        username: user.username,
        image_url: picture,
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
    });
    res.status(201).json(responseObj);
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
