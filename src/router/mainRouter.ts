import { Router } from "express";
import { verifyAuth } from "../middleware/authVerification";
import { AUTH, POST } from "./routes";
import { authRouter } from "./authRouter";
import { postRouter } from "./postRouter";

const mainRouter = Router();

mainRouter.use(AUTH.ROOT, authRouter);

mainRouter.use(verifyAuth());

mainRouter.use(POST.ROOT, postRouter);

export { mainRouter };
