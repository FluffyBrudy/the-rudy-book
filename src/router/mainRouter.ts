import { Router } from "express";
import { verifyAuth } from "../middleware/authVerification";
import { AUTH, COMMENT, POST } from "./routes";
import { authRouter } from "./authRouter";
import { postRouter } from "./postRouter";
import { commentRouter } from "./commentRouter";

const mainRouter = Router();

mainRouter.use(AUTH.ROOT, authRouter);

mainRouter.use(verifyAuth());

mainRouter.use(POST.ROOT, postRouter);

mainRouter.use(COMMENT.ROOT, commentRouter);

export { mainRouter };
