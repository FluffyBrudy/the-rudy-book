import { Router } from "express";
import { POST } from "./routes";
import { CreatePostController } from "../controller/post/createPostController";
import { RetrivePostController } from "../controller/post/retrivePostController";
import { RetrivePostsByIdController } from "../controller/post/retrivePostsByIdController";
import { RetrivePostsController } from "../controller/post/retrivePostsController";
import { SearchPostController } from "../controller/post/searchPostController";

const postRouter = Router();

postRouter.post(POST.CREATE, CreatePostController);
postRouter.get(POST.FETCH, RetrivePostsController);
postRouter.get(POST.FETCH_BY_ID, RetrivePostController);
postRouter.get(POST.FETCH_USER_POST, RetrivePostsByIdController);
postRouter.get(POST.SEARCH, SearchPostController)

export { postRouter };
