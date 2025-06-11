import { Router } from "express";
import { REACTION } from "./routes";
import { CreateUserReactionController } from "../controller/reactionController/reactionController";

const reactionRouter = Router();

reactionRouter.post(REACTION.CREATE, CreateUserReactionController);

export { reactionRouter };
