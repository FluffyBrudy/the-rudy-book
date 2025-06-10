import { Router } from "express";
import { POST } from "./routes";
import {
  CreateCommentController,
  RetriveCommentsController,
} from "../comment/commentController";

const commentRouter = Router();

commentRouter.post(POST.CREATE, CreateCommentController);
commentRouter.get(POST.FETCH, RetriveCommentsController);

export { commentRouter };
