import { Router } from "express";
import { AUTH } from "./routes";
import {
  LoginController,
  RegisterControllerPost,
} from "../controller/auth/authController";

const authRouter = Router();

authRouter.post(AUTH.REGISTER, RegisterControllerPost);
authRouter.post(AUTH.LOGIN, LoginController);

export { authRouter };
