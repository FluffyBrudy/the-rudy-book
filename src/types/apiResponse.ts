interface BaseResponse {
  success: boolean;
  status: number;
  data: any;
}

type RegisterResponse = null;

interface LoginResponse {
  accessToken: string;
  userId: string;
  username: string;
  email: string;
  profilePicture: string;
}
