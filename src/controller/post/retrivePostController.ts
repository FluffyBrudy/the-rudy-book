import { formatDistanceToNow } from "date-fns";
import { RequestHandler } from "express";
import { OperandValueExpression } from "kysely";
import { mainDb } from "../../database/dbClient";
import { ApiError, LoggerApiError } from "../../errors/errors";
import { aggregatedReactions, totalReactionCount } from "../../lib/dbQueryFraments";
import { wrapResponse } from "../../utils/responseWrapper";
import { PostResponse } from "../../types/apiResponse";
import { DB } from "../../types/db/maindb";
import { ExpressUser } from "../../types/globalTypes";

export const RetrivePostController: RequestHandler = async (req, res, next) => {
  const user = req.user as ExpressUser;
  const postId = req.params?.postId as unknown as
    | OperandValueExpression<DB, "post", "post.post_id">
    | undefined;

  if (!postId) return next(new ApiError(422, "invalid postId", true));
  try {
    const post = await mainDb
      .selectFrom("post")
      .leftJoin("media_content", "media_content.post_id", "post.post_id")
      .leftJoin("text_content", "text_content.post_id", "post.post_id")
      .leftJoin("reaction", (join) =>
        join
          .onRef("reaction.reaction_on_id", "=", "post.post_id")
          .on("reaction.reaction_on_type", "=", "post")
      )
      .selectAll("post")
      .select((eb) =>
        eb.fn.jsonAgg("media_content.media_url").distinct().as("mediaUrls")
      )
      .select("text_content.content")
      .select([totalReactionCount(), aggregatedReactions()])
      .where("post.post_id", "=", postId)
      .groupBy([
        "post.post_id",
        "post.author_id",
        "post.username",
        "post.image_url",
        "post.created_at",
        "text_content.content",
      ])
      .limit(1)
      .executeTakeFirst();

    if (!post) return next(new ApiError(404, "post not found", true));

    const response = wrapResponse<PostResponse>({
      authorId: post.author_id,
      postId: post.post_id,
      content: {
        textContent: post.content ?? undefined,
        mediaContent: post.mediaUrls?.every(Boolean)
          ? (post.mediaUrls as string[])
          : [],
      },
      createdAt: formatDistanceToNow(post.created_at!, { addSuffix: true }),
      username: post.username,
      profilePicture: post.image_url,
      totalReaction: post.totalReaction,
      reactions: post.reactions,
    });
    res.json(response);
  } catch (error) {
    return next(new LoggerApiError(error, 500));
  }
};
