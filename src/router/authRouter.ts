import { Router } from "express";
import { AUTH } from "./routes";
import { LoginController } from "../controller/auth/loginController";
import { RegisterController } from "../controller/auth/registerController";
import { verifyAuth } from "../middleware/authVerification";
import { TokenAuthorizationController } from "../controller/auth/tokenAuthorizationController";
import { TokenRefreshController } from "../controller/auth/tokenRefreshController";
import { LogoutController } from "../controller/auth/logoutController";

const authRouter = Router();

authRouter.post(AUTH.REGISTER, RegisterController);
authRouter.post(AUTH.LOGIN, LoginController);
authRouter.post(AUTH.REFRESH_TOKEN, TokenRefreshController);
authRouter.get(AUTH.AUTHORIZE, verifyAuth(), TokenAuthorizationController);
authRouter.post(AUTH.LOGOUT, verifyAuth(), LogoutController)

export { authRouter };
