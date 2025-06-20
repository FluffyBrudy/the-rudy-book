import { Router } from "express";
import { AUTH } from "./routes";
import {
  LoginController,
  RegisterController,
} from "../controller/auth/authController";
import { verifyAuth } from "../middleware/authVerification";
import {
  TokenAuthorizationController,
  TokenRefreshController,
} from "../controller/auth/tokenController";

const authRouter = Router();

authRouter.post(AUTH.REGISTER, RegisterController);
authRouter.post(AUTH.LOGIN, LoginController);
authRouter.post(AUTH.REFRESH_TOKEN, TokenRefreshController);
authRouter.get(AUTH.AUTHORIZE, verifyAuth(), TokenAuthorizationController);

export { authRouter };
