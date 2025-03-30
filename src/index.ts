import express, { NextFunction, Request, Response } from "express";
import passport from "passport";
import { ApiError } from "./errors/errors";
import { verifyAuth } from "./middleware/authVerification";
import { authStrategy } from "./middleware/autStrategy";
import { mainSession } from "./middleware/mainSession";
import { MainRouter } from "./routers/mainRouter";

require("dotenv").config();

const app = express();
app.use(mainSession());
app.use(express.json());
app.use(passport.session());
passport.use(authStrategy());

app.get("/", (req, res, next) => {
  res.json("hi how  r u");
});

app.use("/api", MainRouter);

app.use(verifyAuth);

app.get("/protected", (req, res, next) => {
  res.json("this is protected route");
});

app.use((err: ApiError, _: Request, res: Response, __: NextFunction) => {
  const { status, message } = err;
  res.status(status).json(message);
});

if (process.env.NODE_ENV === "dev") {
  app.listen(3000, () => {
    console.log("Running at http://localhost:3000");
  });
}
