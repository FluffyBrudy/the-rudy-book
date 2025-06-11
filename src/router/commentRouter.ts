import { Router } from "express";
import { POST } from "./routes";
import {
  CreateCommentController,
  RetriveCommentsController,
} from "../controller/comment/commentController";

const commentRouter = Router();

commentRouter.post(POST.CREATE, CreateCommentController);
commentRouter.get(POST.FETCH, RetriveCommentsController);

export { commentRouter };
