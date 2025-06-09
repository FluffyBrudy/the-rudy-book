import { RequestHandler } from "express";
import * as yup from "yup";
import { MAX_POST_CONTENT_LENGTH } from "../../constants/validation";
import { mainDb } from "../../database/dbClient";
import { LoggerApiError } from "../../errors/errors";

const PostSchemaValidation = yup.object().shape({
  authorId: yup
    .string()
    .required("authorId is required")
    .trim()
    .uuid("id must be valid uuid"),
  contents: yup
    .object()
    .shape({
      textContent: yup
        .string()
        .optional()
        .nullable()
        .trim()
        .min(1)
        .max(
          MAX_POST_CONTENT_LENGTH,
          `post cannot exceed ${MAX_POST_CONTENT_LENGTH} characters`
        ),
      mediaContent: yup
        .array()
        .optional()
        .min(1)
        .nullable()
        .of(
          yup.string().trim().url().required("each element must be valid url")
        ),
    })
    .required("post content is required")
    .test("NoContent", "either text or media must be provided", (value) => {
      const textContent = value.textContent?.trim();
      const mediaContent = value.mediaContent;

      if (!textContent && !mediaContent) return false;
      return true;
    }),
});

export const CreatePostController: RequestHandler = async (req, res, next) => {
  try {
    const { authorId, contents } = PostSchemaValidation.validateSync(req.body);
    const insertionPromise: Promise<any>[] = [];

    await mainDb.transaction().execute(async (trx) => {
      const response: Record<string, Record<string, any>> = {};

      const postReponse = await trx
        .insertInto("post")
        .values({ author_id: authorId })
        .returningAll()
        .executeTakeFirstOrThrow();

      const postId = postReponse.post_id;
      if (contents.textContent) {
        const textContentPromise = trx
          .insertInto("text_content")
          .values({
            content: contents.textContent,
            post_id: postId,
          })
          .returningAll()
          .executeTakeFirst()
          .then((textContent) => {
            if (!textContent) {
              throw new Error("unable to insert text content");
            }
            response.textContent = textContent;
          });
        insertionPromise.push(textContentPromise);
      }
      if (contents.mediaContent) {
        const mediaContentPromise = trx
          .insertInto("media_content")
          .values(
            contents.mediaContent.map((value) => ({
              post_id: postId,
              media_url: value,
            }))
          )
          .returningAll()
          .execute()
          .then((mediaContent) => {
            if (!mediaContent) {
              throw new Error("unable to insert media content");
            }
            response.mediaContent = mediaContent;
          });
        insertionPromise.push(mediaContentPromise);
      }
      await Promise.all(insertionPromise);
    });
  } catch (error) {
    return next(new LoggerApiError(error, 500));
  }
};
