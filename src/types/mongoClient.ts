import { EReactions } from "./enums";

export interface IUser {
  username: string;
  imageUrl: string;
  userId: string; // comes from postgresql which i used on pigeon messanger project
}

export interface IPost extends IUser {
  content: string;
  createdAt?: Date;
  comments?: Array<IComment>;
  reactions?: {
    [K in keyof EReactions]: EReactions;
  };
}

export interface IComment extends IUser {
  postId: string;
  content: string;
  createdAt: Date;
  parentCommentId?: string;
  reactions?: {
    [K in keyof EReactions]: EReactions;
  };
  replies: Array<IComment>;
}

export interface IReaction extends IUser {
  targetId: string; // can be either comment id or post id
  reactionType: {
    [K in EReactions]: number;
  };
}
