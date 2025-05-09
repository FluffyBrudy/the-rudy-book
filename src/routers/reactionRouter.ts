import { Router } from "express";
import { REACTION } from "./constants";
import { CreateReactionController } from "../controllers/reaction/reactionController";

const ReactionRouter = Router();
ReactionRouter.post(REACTION.CREATE, CreateReactionController);

export { ReactionRouter };
