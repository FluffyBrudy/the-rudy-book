/**
 * This file was generated by kysely-codegen.
 * Please do not edit it manually.
 */

import type { ColumnType } from "kysely";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Comment {
  comment_body: string;
  comment_id: Generated<number>;
  commenter_id: string;
  created_at: Generated<Timestamp>;
  image_url: string;
  post_id: number;
  udpated_at: Generated<Timestamp>;
  username: string;
}

export interface CommentReply {
  comment_reply_id: Generated<number>;
  created_at: Generated<Timestamp>;
  image_url: string;
  parent_comment_id: number;
  replied_by_id: string;
  reply_content: string;
  udpated_at: Generated<Timestamp>;
  username: string;
}

export interface MediaContent {
  media_content_id: Generated<number>;
  media_url: string;
  post_id: number;
}

export interface Notification {
  created_at: Generated<Timestamp | null>;
  id: Generated<number>;
  is_read: Generated<boolean>;
  notification_info: string;
  notification_on_id: number;
  notification_on_type: string;
  user_id: string;
}

export interface Post {
  author_id: string;
  created_at: Generated<Timestamp | null>;
  image_url: string;
  post_id: Generated<number>;
  updated_at: Generated<Timestamp>;
  username: string;
}

export interface Reaction {
  image_url: string;
  reaction_on_id: number;
  reaction_on_type: string;
  reaction_type: string;
  reactor_id: string;
  username: string;
}

export interface TextContent {
  content: string;
  content_tsv?: string; // tsvector hardcoded for now cuz i added not null constraint 👀
  post_id: number;
  text_content_id: Generated<number>;
}

export interface TopPosts {
  computed_at: Generated<Timestamp | null>;
  id: Generated<number>;
  post_id: number;
}

export interface DB {
  comment: Comment;
  comment_reply: CommentReply;
  media_content: MediaContent;
  notification: Notification;
  post: Post;
  reaction: Reaction;
  text_content: TextContent;
  top_posts: TopPosts;
}
