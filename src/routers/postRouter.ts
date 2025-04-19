import { Router } from "express";
import { POST } from "./constants";
import { CreatePostController } from "../controllers/post/PostController";

const PostRouter = Router();
PostRouter.post(POST.CREATE, CreatePostController);

export { PostRouter };
