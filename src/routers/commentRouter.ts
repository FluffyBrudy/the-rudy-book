import { Router } from "express";
import {
  CommentReactController,
  CreateCommentController,
} from "../controllers/comment/CommentController";
import { COMMENT } from "./constants";

const CommentRouter = Router();
CommentRouter.post(COMMENT.CREATE, CreateCommentController);
CommentRouter.post(COMMENT.COMMENT_REACTION, CommentReactController);

export { CommentRouter };
