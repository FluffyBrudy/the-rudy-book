import e, { RequestHandler } from "express";
import * as yup from "yup";
import { MAX_POST_CONTENT_LENGTH } from "../../constants/validation";
import { mainDb, pigeonDb } from "../../database/dbClient";
import {
  ApiError,
  BodyValidationError,
  LoggerApiError,
} from "../../errors/errors";
import { wrapResponse } from "../../utils/responseWrapper";
import { PostResponse } from "../../types/apiResponse";
import { ExpressUser } from "../../types/globalTypes";
import { validateImageURLS } from "../../utils/imageValidation";
import { Log, Selectable, sql } from "kysely";
import { Post } from "../../types/db/maindb";
import { logger } from "../../logger/logger";

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

    const user = req.user as ExpressUser; // i am sure because this always  happend in authentication middleware

    await mainDb.transaction().execute(async (trx) => {
      const insertionPromise: Promise<any>[] = [];

      const userProfile = await pigeonDb
        .selectFrom("Profile")
        .select(["Profile.picture"])
        .where("userId", "=", user.id)
        .limit(1)
        .executeTakeFirst();

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
      const responseObj = wrapResponse<PostResponse>(response);
      res.status(200).json(responseObj);
    });
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
  console.log(user.id);
  try {
    const posts = await retriveFriendsPost(user.id);
    if (!posts) return next(new ApiError(500, "unable to retrive post", true));
    const responseObj = wrapResponse<PostResponse[]>(posts);
    res.status(200).json(responseObj);
  } catch (error) {
    return next(new LoggerApiError(error, 500));
  }
};

async function retriveFriendsPost(userId: Selectable<Post>["author_id"]) {
  try {
    const friendsId = (
      await pigeonDb
        .selectFrom("AcceptedFriendship")
        .select((eb) =>
          eb
            .case()
            .when("userId1", "=", userId)
            .then(eb.ref("userId2"))
            .else(eb.ref("userId1"))
            .end()
            .as("friendId")
        )
        .where((eb) =>
          eb.or([eb("userId1", "=", userId), eb("userId2", "=", userId)])
        )
        .execute()
    ).map(({ friendId }) => friendId);

    console.log(friendsId);

    const posts = await mainDb
      .selectFrom("post")
      .leftJoin("text_content", "text_content.post_id", "post.post_id")
      .leftJoin("media_content", "media_content.post_id", "post.post_id")
      .selectAll("post")
      .select((eb) => eb.fn.jsonAgg("media_content.media_url").as("mediaUrls"))
      .select("text_content.content")
      .where("author_id", "in", friendsId)
      .groupBy(["post.post_id", "text_content.content"])
      .orderBy("created_at", "desc")
      .execute();

    return posts.map(
      (post) =>
        ({
          authorId: post.author_id,
          postId: post.post_id,
          content: {
            textContent: post.content,
            mediaContent: post.mediaUrls,
          },
          createdAt: post.created_at,
          updatedAt: post.updated_at,
          username: post.username,
          profilePicture: post.image_url,
        } as PostResponse)
    );
  } catch (error) {
    logger.error(error);
    return null;
  }
}
