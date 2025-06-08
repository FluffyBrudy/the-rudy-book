import { Router } from "express";
import { verifyAuth } from "../middleware/authVerification";
import { AUTH } from "./routes";
import { authRouter } from "./authRouter";

const mainRouter = Router();

mainRouter.use(AUTH.ROOT, authRouter);

// mainRouter.use(verifyAuth());

export { mainRouter };
