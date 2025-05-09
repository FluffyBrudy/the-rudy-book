import { Router } from "express";
import { POST } from "./constants";
import { CreatePostController } from "../controllers/post/postController";

const PostRouter = Router();
PostRouter.post(POST.CREATE, CreatePostController);

export { PostRouter };
