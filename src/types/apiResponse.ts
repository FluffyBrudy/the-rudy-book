export interface BaseResponse {
  success: boolean;
  data?: any;
}

export type RegisterResponse = null;

export type LoginResponse = {
  accessToken: string;
  userId: string;
  username: string;
  email: string;
  profilePicture: string;
};

export type PostResponse = {
  authorId: string;
  postId: number;
  content: {
    textContent?: string;
    mediaContent?: string[];
  };
  createdAt?: Date | string;
  updatedAt?: Date | string;
  username: string;
  profilePicture: string;
  totalReaction: number;
  reactions: reactionDisplayInfo;
};

export type CommentResponse = {
  commentId: number;
  commentorId: string;
  commentBody: string;
  postId: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
  username: string;
  profilePicture: string;
  totalReaction: number;
  reactions: reactionDisplayInfo;
};

export type ReactionResponse = {
  profilePicture: string;
  reactionOnId: number;
  reactionOnType: string;
  reactionType: string;
  reactorTd: string;
  username: string;
  action: "inserted" | "removed" | "toggled";
};

export type reactionDisplayInfo = Omit<
  ReactionResponse,
  "reactionOnId" | "reactionOnType"
>[];

export type UndoReactionResponse = {
  undo: true;
  reactionOnId: number;
  reactorId: string;
  action: "inserted" | "removed" | "toggled";
};

export type CommentReplyResponse = {
  commentReplyId: number;
  createdAt: Date | string;
  profilePicture: string;
  parentCommentId: number;
  repliedById: string;
  replyContent: string;
  updatedAt?: Date | string;
  username: string;
  totalReaction: number;
  reactions: reactionDisplayInfo;
  postId?: number;
};

export type NotificationsResponse = {
  notificationId: number;
  userId: string;
  notificationInfo: string;
  notificationOnId: number;
  notificationOnType: string;
  createdAt: Date | string;
  isRead: boolean;
};

export type SearchPostResponse = {
  postId: number;
  matchedContent: string;
  fullContent: string
}