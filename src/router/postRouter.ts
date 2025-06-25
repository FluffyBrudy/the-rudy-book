import { Router } from "express";
import { POST } from "./routes";
import {
  CreatePostController,
  RetrivePostController,
  RetrivePostsController,
} from "../controller/post/postController";

const postRouter = Router();

postRouter.post(POST.CREATE, CreatePostController);
postRouter.get(POST.FETCH, RetrivePostsController);
postRouter.get(POST.FETCH_BY_ID, RetrivePostController);

export { postRouter };
