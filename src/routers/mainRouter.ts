import { Router } from "express";
import { COMMENT, POST } from "./constants";
import { PostRouter } from "./postRouter";
import { verifyAuth } from "../middleware/authVerification";
import { CommentRouter } from "./commentRouter";

const MainRouter = Router();

MainRouter.use(verifyAuth());

MainRouter.use(POST.ROOT, PostRouter);
MainRouter.use(COMMENT.ROOT, CommentRouter);

export { MainRouter };
