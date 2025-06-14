import { Selectable, sql } from "kysely";
import { Post } from "../types/db/maindb";
import { logger } from "../logger/logger";
import { mainDb, pigeonDb } from "../database/dbClient";
import { Profile } from "../types/db/pigeondb";
import { TableFieldSelection } from "../types/globalTypes";
import { EReactionOnTypes, EReactionTypes } from "../constants/validation";

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
  notificationOnType: EReactionTypes
) {
  try {
    const notification = await mainDb
      .insertInto("notification")
      .values({
        user_id: receiverId,
        notification_info: notificationInfo,
        notification_on_id: notificationOnId,
        notification_on_type: notificationOnType,
      })
      .executeTakeFirstOrThrow();
    return notification;
  } catch (error) {
    logger.error(error);
    return null;
  }
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
      throw new Error("Invalid target type");
  }
}
