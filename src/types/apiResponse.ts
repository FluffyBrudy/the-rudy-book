export interface BaseResponse {
  success: boolean;
  data: any;
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
  createdAt?: Date;
  updatedAt?: Date;
  username: string;
  profilePicture: string;
};

export type CommentResponse = {
  commentId: number;
  commentorId: string;
  commentBody: string;
  postId: number;
  createdAt: Date;
  updatedAt?: Date;
  username: string;
  profilePicture: string;
};

export type ReactionResponse = {
  imageUrl: string;
  reactionOnId: number;
  reactionOnType: string;
  reactionType: string;
  reactorTd: string;
  username: string;
};

export type CommentReplyResponse = {
  commentReplyId: number;
  createdAt: Date;
  profilePicture: string;
  parentCommentId: number;
  repliedById: string;
  replyContent: string;
  updatedAt?: Date;
  username: string;
};
