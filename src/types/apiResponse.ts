export interface BaseResponse {
  success: boolean;
  status: number;
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

export type CreatePostResponse = {
  authorId: string;
  postId: number;
  content: {
    textContent?: string;
    mediaContent?: string[];
  };
};
