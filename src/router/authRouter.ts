import { Router } from "express";
import { AUTH } from "./routes";
import {
  LoginController,
  RegisterController,
} from "../controller/auth/authController";

const authRouter = Router();

authRouter.post(AUTH.REGISTER, RegisterController);
authRouter.post(AUTH.LOGIN, LoginController);

export { authRouter };
