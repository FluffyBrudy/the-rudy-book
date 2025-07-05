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
import { sendNotification } from "../../lib/notificationSender";
import { logger } from "../../logger/logger";
import { CommentReplyResponse } from "../../types/apiResponse";
import { ExpressUser } from "../../types/globalTypes";
import { wrapResponse } from "../../utils/responseWrapper";
import { formatDistanceToNow } from "date-fns";

const CommentReplySchema = yup
  .object()
  .shape({
    replyContent: yup
      .string()
      .required("reply must not be empty")
      .trim()
      .min(1, "reply must not be empty"),
    parentCommentId: yup.number().required("comment id is required"),
  });

export const CreateCommentReplyController: RequestHandler = async (
  req,
  res,
  next
) => {
  const user = req.user as ExpressUser;
  try {
    const { parentCommentId, replyContent } = CommentReplySchema.validateSync(
      req.body
    );

    const profile = await retrieveProfile<"picture">(user.id);
    const commentReply = await mainDb
      .insertInto("comment_reply")
      .values({
        parent_comment_id: parentCommentId,
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
      createdAt: formatDistanceToNow(commentReply.created_at, {
        addSuffix: true,
      }),
      profilePicture: commentReply.image_url,
      parentCommentId: commentReply.parent_comment_id,
      repliedById: commentReply.replied_by_id,
      replyContent: commentReply.reply_content,
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
          commentReply.comment_reply_id,
          EReactionOnTypes.REPLY,
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
