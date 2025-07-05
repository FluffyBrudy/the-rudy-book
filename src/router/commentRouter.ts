import { Router } from "express";
import { COMMENT } from "./routes";
import { CreateCommentController } from "../controller/comment/createCommentController";
import { RetriveCommentController } from "../controller/comment/retriveCommentController";
import { RetriveCommentsController } from "../controller/comment/retriveCommentsController";
import { CreateCommentReplyController } from "../controller/comment/createCommentReplyController";
import { RetriveCommentRepliesController } from "../controller/comment/retriveCommentRepliesController";
import { RetriveCommentReplyController } from "../controller/comment/retriveCommentReplyController";

const commentRouter = Router();
const commentReplyRouter = Router();

commentRouter.post(COMMENT.CREATE, CreateCommentController);
commentRouter.post(COMMENT.FETCH, RetriveCommentsController);
commentRouter.get(COMMENT.FETCH_COMMENT_BY_ID, RetriveCommentController);

commentReplyRouter.post(COMMENT.CREATE, CreateCommentReplyController);
commentReplyRouter.post(COMMENT.FETCH, RetriveCommentRepliesController);
commentReplyRouter.get(
  COMMENT.FETCH_REPLY_BY_ID,
  RetriveCommentReplyController
);

commentRouter.use(COMMENT.REPLY_ROOT, commentReplyRouter);

export { commentRouter };
