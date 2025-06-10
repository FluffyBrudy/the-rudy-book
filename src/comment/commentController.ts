import { RequestHandler } from "express";
import * as yup from "yup";
import { MAX_COMMENT_LENGTH } from "../constants/validation";
import { ExpressUser } from "../types/globalTypes";
import { mainDb, pigeonDb } from "../database/dbClient";
import { Selectable, sql } from "kysely";
import { ApiError, LoggerApiError } from "../errors/errors";
import { wrapResponse } from "../utils/responseWrapper";
import { CommentResponse } from "../types/apiResponse";
import { Post } from "../types/db/maindb";
import { logger } from "../logger/logger";

const RetriveCommentSchema = yup.object().shape({
  postId: yup.number().required("post id is required"),
  datetime: yup.date().default(() => new Date()),
});
const CreateCommentSchema = yup
  .object()
  .shape({
    commentBody: yup
      .string()
      .required("comment must have at least one content")
      .trim()
      .min(1, "comment must not be empty")
      .max(MAX_COMMENT_LENGTH),
  })
  .concat(RetriveCommentSchema);

export const CreateCommentController: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { commentBody, postId } = await CreateCommentSchema.validate(
      req.body
    );
    const { username, id } = req.user as ExpressUser;
    const userId = id;

    const [postExists, userRes] = await Promise.all([
      checkPostExist(postId),
      pigeonDb
        .selectFrom("Profile")
        .select(["Profile.picture"])
        .where("userId", "=", userId)
        .limit(1)
        .executeTakeFirst(),
    ]);

    if (!postExists) return next(new ApiError(400, "post doesnt exist", true));

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
      createdAt: comment.created_at,
      username: comment.username,
      profilePicture: comment.image_url,
    });

    res.status(201).json(responseObj);
  } catch (error) {
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
      .select([
        "comment.comment_id",
        "comment.comment_body",
        "comment.commenter_id",
        "comment.created_at",
        "comment.post_id",
        "comment.username",
        "comment.image_url",
      ])
      .where("comment.post_id", "=", postId)
      .execute();

    const responseObjs = wrapResponse<CommentResponse[]>(
      comments.map((comment) => ({
        commentId: comment.comment_id,
        commentorId: userId,
        commentBody: comment.comment_body,
        postId: postId,
        createdAt: comment.created_at,
        username: comment.username,
        profilePicture: comment.image_url,
      }))
    );
    res.status(200).json(responseObjs);
  } catch (error) {
    return next(new LoggerApiError(error, 500));
  }
};

async function checkPostExist(postId: Selectable<Post>["post_id"]) {
  try {
    const postExist = await mainDb
      .selectFrom("post")
      .select(sql`1`.as("dummy"))
      .where("post_id", "=", postId)
      .execute();
    return !!postExist;
  } catch (error) {
    logger.error(error);
    return false;
  }
}
