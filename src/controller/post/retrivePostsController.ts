import { formatDistanceToNow } from "date-fns";
import { RequestHandler } from "express";
import { retrieveAcceptedFriendship } from "../../lib/dbCommonQuery";
import { retrivePosts } from "../../lib/dbCommonQuery";
import { ApiError, LoggerApiError } from "../../errors/errors";
import { PostResponse } from "../../types/apiResponse";
import { ExpressUser } from "../../types/globalTypes";
import { wrapResponse } from "../../utils/responseWrapper";
import { logger } from "../../logger/logger";
import { mainDb } from "../../database/dbClient";
import {
  aggregatedReactions,
  totalReactionCount,
} from "../../lib/dbQueryFraments";

export const RetrivePostsController: RequestHandler = async (
  req,
  res,
  next
) => {
  const user = req.user as ExpressUser;
  try {
    const friendsId = await retrieveAcceptedFriendship(user.id);
    const postFetchPromises = await Promise.all([
      retriveRandomPostByReactionEngagement([user.id, ...friendsId]),
      retrivePosts(user.id, friendsId),
    ]);
    const filteredPost = postFetchPromises.filter(
      Boolean
    ) as unknown as PostResponse[];
    const posts = filteredPost.reduce(
      (accm, post) => accm.concat(post),
      [] as PostResponse[]
    );

    if (!posts) return next(new ApiError(500, "unable to retrive post", true));
    const responseObj = wrapResponse<PostResponse[]>(posts);
    res.status(200).json(responseObj);
  } catch (error) {
    return next(new LoggerApiError(error, 500));
  }
};

async function retriveRandomPostByReactionEngagement(
  omitableIds: Array<string>
) {
  try {
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
      .select((eb) =>
        eb.fn.jsonAgg("media_content.media_url").distinct().as("mediaUrls")
      )
      .select([totalReactionCount(), aggregatedReactions()])
      .select("text_content.content")
      .where("author_id", "not in", [...omitableIds])
      .groupBy([
        "post.post_id",
        "post.author_id",
        "post.created_at",
        "post.updated_at",
        "post.image_url",
        "post.username",
        "text_content.content",
      ])
      .orderBy("totalReaction", "desc")
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
