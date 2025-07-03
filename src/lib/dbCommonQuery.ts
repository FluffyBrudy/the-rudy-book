import { Selectable, sql } from "kysely";
import { Post } from "../types/db/maindb";
import { logger } from "../logger/logger";
import { mainDb, pigeonDb } from "../database/dbClient";
import { Profile } from "../types/db/pigeondb";
import { TableFieldSelection } from "../types/globalTypes";
import { EReactionOnTypes } from "../constants/validation";
import { aggregatedReactions, totalReactionCount } from "./dbQueryFraments";
import { formatDistanceToNow } from "date-fns";
import { PostResponse } from "../types/apiResponse";

export async function checkPostExist(postId: Selectable<Post>["post_id"]) {
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

export async function retrieveProfile<T extends keyof Profile>(
  userId: string,
  fields: TableFieldSelection<Profile> = { picture: true } as any
): Promise<Pick<Selectable<Profile>, T> | undefined> {
  const selectableFields = Object.keys(fields).filter(
    (field) => fields[field as keyof typeof fields]
  ) as Array<keyof typeof fields>;

  if (selectableFields.length === 0)
    throw new Error("fields for profile retrieval should not be empty");

  const profile = await pigeonDb
    .selectFrom("Profile")
    .select(selectableFields)
    .where("userId", "=", userId)
    .limit(1)
    .executeTakeFirst();

  return profile;
}

export async function createNotification(
  receiverId: string,
  notificationInfo: string,
  notificationOnId: number,
  notificationOnType: EReactionOnTypes
) {
  const notification = await mainDb
    .insertInto("notification")
    .values({
      user_id: receiverId,
      notification_info: notificationInfo,
      notification_on_id: notificationOnId,
      notification_on_type: notificationOnType,
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  return notification;
}

export async function retrieveAcceptedFriendship(userId: string) {
  return (
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
}

export async function checkTargetExist(
  reactionOnType: EReactionOnTypes,
  targetId: number
) {
  switch (reactionOnType) {
    case EReactionOnTypes.COMMENT:
      const commentExists = await mainDb
        .selectFrom("comment")
        .select("comment.commenter_id")
        .where("comment.comment_id", "=", targetId)
        .executeTakeFirstOrThrow();
      return commentExists.commenter_id;
    case EReactionOnTypes.POST:
      const postExists = await mainDb
        .selectFrom("post")
        .select("author_id")
        .where("post.post_id", "=", targetId)
        .executeTakeFirstOrThrow();
      return postExists.author_id;
    case EReactionOnTypes.REPLY:
      const replyExists = await mainDb
        .selectFrom("comment_reply")
        .select("replied_by_id")
        .where("comment_reply.comment_reply_id", "=", targetId)
        .executeTakeFirstOrThrow();
      return replyExists.replied_by_id;
    default:
      return null;
  }
}

export async function retrivePosts(
  userId: Selectable<Post>["author_id"],
  targetIds: string[],
  includeUser = true,
  cursor = new Date()
) {
  const other = includeUser ? [userId] : [];
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
      .select((eb) => eb.fn.jsonAgg("media_content.media_url").distinct().as("mediaUrls"))
      .select([totalReactionCount(), aggregatedReactions()])
      .select("text_content.content")
      .where("author_id", "in", [...targetIds, ...other])
      .where("post.created_at", "<", cursor)
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
          createdAt: post.created_at,
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
