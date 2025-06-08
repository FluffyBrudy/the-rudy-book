import { Router } from "express";
import { AUTH } from "./routes";
import { registerControllerPost } from "../controller/auth/authController";

const authRouter = Router();

authRouter.post(AUTH.REGISTER, registerControllerPost);

export { authRouter };
