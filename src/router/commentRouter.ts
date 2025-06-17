import { Router } from "express";
import { COMMENT } from "./routes";
import {
  CreateCommentController,
  RetriveCommentsController,
} from "../controller/comment/commentController";
import {
  CreateCommentReplyController,
  RetriveCommentRepliesController,
} from "../controller/comment/commentReplyController";

const commentRouter = Router();
const commentReplyRouter = Router();

commentRouter.post(COMMENT.CREATE, CreateCommentController);
commentRouter.post(COMMENT.FETCH, RetriveCommentsController);

commentReplyRouter.post(COMMENT.CREATE, CreateCommentReplyController);
commentReplyRouter.post(COMMENT.FETCH, RetriveCommentRepliesController);

commentRouter.use(COMMENT.REPLY_ROOT, commentReplyRouter);

export { commentRouter };
