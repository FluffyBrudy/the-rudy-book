import { ObjectId } from "mongodb";
import { EReactions } from "./enums";
import { ExpressUser } from "./global";
import { COLLECTIONS } from "../db/mongoClient/mongoClient";

type User = Omit<ExpressUser, "id"> & { userId: string };

export type TComment = COLLECTIONS.COMMENT;
export type TPost = COLLECTIONS.POST;

export interface IPost extends User {
  content: string;
  createdAt: Date;
  comments: Array<IComment>;
  reactions: {
    [K in EReactions]: number;
  };
  reactionIds: Array<ObjectId>;
}

export interface IComment extends User {
  postId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  parentCommentId?: string;
  reactions: {
    [K in EReactions]: number;
  };
  replies: Array<IComment>;
}

export interface IReaction {
  userId: string;
  targetId: string; // can be either comment id or post id
  reactionType: EReactions;
  targetType: TComment | TPost;
}
