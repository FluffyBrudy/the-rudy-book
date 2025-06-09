import { RequestHandler } from "express";
import * as yup from "yup";
import { MAX_POST_CONTENT_LENGTH } from "../../constants/validation";
import { mainDb } from "../../database/dbClient";
import {
  ApiError,
  BodyValidationError,
  LoggerApiError,
} from "../../errors/errors";
import { wrapResponse } from "../../utils/responseWrapper";
import { CreatePostResponse } from "../../types/apiResponse";
import { ExpressUser } from "../../types/globalTypes";
import { validateImageURLS } from "../../utils/imageValidation";

const PostSchemaValidation = yup.object().shape({
  contents: yup
    .object()
    .shape({
      textContent: yup
        .string()
        .optional()
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
    })
    .test(
      "InvalidMedia",
      "url must exist and be of media type (image)",
      async (value) => {
        const mediaUrls = value.mediaContent!;
        const areUrlsValid = await validateImageURLS(mediaUrls);
        return areUrlsValid;
      }
    ),
});

export const CreatePostController: RequestHandler = async (req, res, next) => {
  try {
    const { contents } = await PostSchemaValidation.validate(req.body);
    const authUser = req.user!;

    const user = req.user as ExpressUser; // i am sure because this always  happend in authentication middleware

    await mainDb.transaction().execute(async (trx) => {
      const insertionPromise: Promise<any>[] = [];

      const postReponse = await trx
        .insertInto("post")
        .values({ author_id: user.id })
        .returningAll()
        .executeTakeFirstOrThrow();
      const postId = postReponse.post_id;

      const response: CreatePostResponse = {
        authorId: user.id,
        postId: postId,
        content: {},
      };

      if (contents.textContent) {
        const textContentPromise = trx
          .insertInto("text_content")
          .values({
            content: contents.textContent,
            post_id: postId,
          })
          .returning("content")
          .executeTakeFirst()
          .then((textContent) => {
            if (!textContent) {
              throw new Error("unable to insert text content");
            }
            response.content.textContent = textContent.content;
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
          .returning("media_url")
          .execute()
          .then((mediaContent) => {
            if (!mediaContent) {
              throw new Error("unable to insert media content");
            }
            response.content.mediaContent = mediaContent.map(
              ({ media_url }) => media_url
            );
          });
        insertionPromise.push(mediaContentPromise);
      }
      await Promise.all(insertionPromise);
      const responseObj = wrapResponse<CreatePostResponse>(response);
      res.json(responseObj);
    });
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return next(new BodyValidationError(error.errors));
    }
    return next(new LoggerApiError(error, 500));
  }
};
