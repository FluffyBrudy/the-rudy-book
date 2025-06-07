import { Router } from "express";
import { ROUTES } from "./routes";
import { verifyAuth } from "../middleware/authVerification";

export const mainRouter = Router();

mainRouter.use(verifyAuth());

mainRouter.use(ROUTES.ROOT, (_, res, __) => {
  res.json({ data: "data sent" });
});
