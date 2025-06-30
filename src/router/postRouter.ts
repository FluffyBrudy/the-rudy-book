import { Router } from "express";
import { POST } from "./routes";
import {
  CreatePostController,
  RetrivePostController,
  RetrivePostsByIdController,
  RetrivePostsController,
} from "../controller/post/postController";

const postRouter = Router();

postRouter.post(POST.CREATE, CreatePostController);
postRouter.get(POST.FETCH, RetrivePostsController);
postRouter.get(POST.FETCH_BY_ID, RetrivePostController);
postRouter.get(POST.FETCH_USER_POST, RetrivePostsByIdController);

export { postRouter };
