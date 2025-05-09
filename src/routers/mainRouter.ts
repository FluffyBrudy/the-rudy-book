import { Router } from "express";
import { COMMENT, POST, REACTION } from "./constants";
import { PostRouter } from "./postRouter";
import { verifyAuth } from "../middleware/authVerification";
import { CommentRouter } from "./commentRouter";
import { ReactionRouter } from "./reactionRouter";

const MainRouter = Router();

MainRouter.use(verifyAuth());

MainRouter.use(POST.ROOT, PostRouter);
MainRouter.use(COMMENT.ROOT, CommentRouter);
MainRouter.use(REACTION.ROOT, ReactionRouter);

export { MainRouter };
