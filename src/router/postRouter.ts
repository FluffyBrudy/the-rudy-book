import { Router } from "express";
import { POST } from "./routes";
import {
  CreatePostController,
  RetrivePostsController,
} from "../controller/post/postController";

const postRouter = Router();

postRouter.post(POST.CREATE, CreatePostController);
postRouter.get(POST.FETCH, RetrivePostsController);

export { postRouter };
