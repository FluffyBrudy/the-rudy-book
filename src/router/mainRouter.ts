import { Router } from "express";
import { verifyAuth } from "../middleware/authVerification";
import { AUTH, COMMENT, NOTIFICATION, POST, REACTION } from "./routes";
import { authRouter } from "./authRouter";
import { postRouter } from "./postRouter";
import { commentRouter } from "./commentRouter";
import { reactionRouter } from "./reactionRouter";
import { notificationRouter } from "./notificationRouter";

const mainRouter = Router();

mainRouter.use(AUTH.ROOT, authRouter);

mainRouter.use(verifyAuth());

mainRouter.use(POST.ROOT, postRouter);

mainRouter.use(COMMENT.ROOT, commentRouter);

mainRouter.use(REACTION.ROOT, reactionRouter);

mainRouter.use(NOTIFICATION.ROOT, notificationRouter);

export { mainRouter };
