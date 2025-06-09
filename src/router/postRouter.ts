import { Router } from "express";
import { POST } from "./routes";
import { CreatePostController } from "../controller/post/postController";

const postRouter = Router();

postRouter.post(POST.CREATE, CreatePostController);

export { postRouter };
