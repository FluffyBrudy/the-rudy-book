import { Router } from "express";
import { AUTH } from "./routes";
import {
  LoginController,
  RegisterController,
} from "../controller/auth/authController";
import { verifyAuth } from "../middleware/authVerification";
import { TokenAuthorizationController } from "../controller/auth/tokenController";

const authRouter = Router();

authRouter.post(AUTH.REGISTER, RegisterController);
authRouter.post(AUTH.LOGIN, LoginController);
authRouter.get(AUTH.AUTHORIZE, verifyAuth(), TokenAuthorizationController);

export { authRouter };
