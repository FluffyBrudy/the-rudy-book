import { formatDistanceToNow } from "date-fns";
import { RequestHandler } from "express";
import * as yup from "yup";
import {
  EReactionOnTypes,
  MAX_POST_MEDIA_CONTENT_LENGTH,
  MAX_POST_TEXT_LENGTH,
} from "../../constants/validation";
import { mainDb } from "../../database/dbClient";
import {
  ApiError,
  BodyValidationError,
  LoggerApiError,
} from "../../errors/errors";
import {
  retrieveAcceptedFriendship,
  retrieveProfile,
} from "../../lib/dbCommonQuery";
import {
  aggregatedReactions,
  totalReactionCount,
} from "../../lib/dbQueryFraments";
import { sendNotification } from "../../lib/notificationSender";
import { logger } from "../../logger/logger";
import { PostResponse } from "../../types/apiResponse";
import { ExpressUser } from "../../types/globalTypes";
import { validateImageURLS } from "../../utils/imageValidation";
import { wrapResponse } from "../../utils/responseWrapper";

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
          MAX_POST_TEXT_LENGTH,
          `post cannot exceed ${MAX_POST_TEXT_LENGTH} characters`
        ),
      mediaContent: yup
        .array()
        .optional()
        .min(1)
        .max(MAX_POST_MEDIA_CONTENT_LENGTH, "Maximum media can only be upto 5")
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
        if (!value.mediaContent) return true;
        const mediaUrls = value.mediaContent!;
        const areUrlsValid = await validateImageURLS(mediaUrls);
        return areUrlsValid;
      }
    ),
});

export const CreatePostController: RequestHandler = async (req, res, next) => {
  try {
    const { contents } = await PostSchemaValidation.validate(req.body);

    const user = req.user as ExpressUser; // i am sure because this always  happend in authentication middleware

    const response = await mainDb.transaction().execute(async (trx) => {
      const insertionPromise: Promise<any>[] = [];

      const userProfile = await retrieveProfile<"picture">(user.id);

      const postReponse = await trx
        .insertInto("post")
        .values({
          author_id: user.id,
          username: user.username,
          image_url: userProfile?.picture ?? "",
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      const postId = postReponse.post_id;

      const response: PostResponse = {
        username: user.username,
        profilePicture: userProfile?.picture ?? "",
        authorId: user.id,
        postId: postId,
        content: {},
        totalReaction: 0,
        createdAt: formatDistanceToNow(postReponse.created_at!, {
          addSuffix: true,
        }),
        reactions: [],
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
      return response;
    });
    const responseObj = wrapResponse<PostResponse>(response);
    res.status(200).json(responseObj);
    retrieveAcceptedFriendship(user.id)
      .then((res) => {
        if (res.length === 0) return;
        const message = `${user.username} has a new post.`;
        const notificationPromises = res.map((receiverId) =>
          sendNotification(
            receiverId,
            message,
            response.postId,
            EReactionOnTypes.POST,
            req.headers.authorization!
          )
        );
        Promise.allSettled(notificationPromises);
      })
      .catch((err) => logger.error(err));
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return next(new BodyValidationError(error.errors));
    }
    return next(new LoggerApiError(error, 500));
  }
};
