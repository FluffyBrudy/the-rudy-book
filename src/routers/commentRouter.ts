import { Router } from "express";
import { CreateCommentController } from "../controllers/comment/CommentController";
import { COMMENT } from "./constants";

const CommentRouter = Router();
CommentRouter.post(COMMENT.CREATE, CreateCommentController);

export { CommentRouter };
