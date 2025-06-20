import { RequestHandler } from "express";
import { Selectable, sql } from "kysely";
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
import { Post } from "../../types/db/maindb";
import { ExpressUser } from "../../types/globalTypes";
import { validateImageURLS } from "../../utils/imageValidation";
import { wrapResponse } from "../../utils/responseWrapper";
import { formatDistanceToNow } from "date-fns";

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

export const RetrivePostsController: RequestHandler = async (
  req,
  res,
  next
) => {
  const user = req.user as ExpressUser;
  try {
    const randomPosts = await retriveFriendsPost(user.id);
    const posts = randomPosts ? randomPosts : await retriveFriendsPost(user.id);
    if (!posts) return next(new ApiError(500, "unable to retrive post", true));
    const responseObj = wrapResponse<PostResponse[]>(posts);
    res.status(200).json(responseObj);
  } catch (error) {
    return next(new LoggerApiError(error, 500));
  }
};

async function retriveFriendsPost(userId: Selectable<Post>["author_id"]) {
  try {
    const friendsId = await retrieveAcceptedFriendship(userId);

    const posts = await mainDb
      .selectFrom("post")
      .leftJoin("reaction", (join) =>
        join
          .onRef("reaction.reaction_on_id", "=", "post.post_id")
          .on("reaction.reaction_on_type", "=", "post")
      )
      .leftJoin("text_content", "text_content.post_id", "post.post_id")
      .leftJoin("media_content", "media_content.post_id", "post.post_id")

      .selectAll("post")
      .select((eb) => eb.fn.jsonAgg("media_content.media_url").as("mediaUrls"))
      .select([totalReactionCount(), aggregatedReactions()])
      .select("text_content.content")
      .where("author_id", "in", [...friendsId, userId])
      .groupBy([
        "post.post_id",
        "post.author_id",
        "post.created_at",
        "post.updated_at",
        "post.image_url",
        "post.username",
        "text_content.content",
      ])
      .orderBy("created_at", "desc")
      .limit(50)
      .execute();

    return posts.map(
      (post) =>
        ({
          authorId: post.author_id,
          postId: post.post_id,
          content: {
            textContent: post.content,
            mediaContent: post.mediaUrls?.every(Boolean) ? post.mediaUrls : [],
          },
          createdAt: formatDistanceToNow(post.created_at!, { addSuffix: true }),
          username: post.username,
          profilePicture: post.image_url,
          totalReaction: post.totalReaction,
          reactions: post.reactions,
        } as PostResponse)
    );
  } catch (error) {
    logger.error(error);
    return null;
  }
}
