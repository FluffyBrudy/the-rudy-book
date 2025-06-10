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
