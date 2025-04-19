import { Router } from "express";
import { POST } from "./constants";
import { PostRouter } from "./postRouter";
import { verifyAuth } from "../middleware/authVerification";

const MainRouter = Router();

MainRouter.use(verifyAuth());

MainRouter.use(POST.ROOT, PostRouter);

export { MainRouter };
