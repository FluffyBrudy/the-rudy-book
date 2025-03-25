import express, { NextFunction, Request, Response } from "express";
import expressSession from "express-session";
import passport from "passport";
import {
  Strategy as JWTStrategy,
  ExtractJwt,
  VerifiedCallback,
} from "passport-jwt";
import { ExpressUser } from "./types/global";
import { PigeonDbClient } from "./db/pigeonDbClient";
import { logger } from "./logger/logger";
import { ApiError, LoggerApiError } from "./errors/errors";
import { verifyAuth } from "./middleware/authVerification";

require("dotenv").config();

const app = express();
app.use(
  expressSession({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "prod",
      httpOnly: process.env.NODE_ENV === "prod",
    },
  })
);
app.use(express.json());
app.use(passport.session());

passport.use(
  new JWTStrategy(
    {
      secretOrKey: process.env.JWT_SECRET!,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (payload: ExpressUser, done: VerifiedCallback) => {
      try {
        const { username, email, id } = payload;
        const user = await PigeonDbClient.checkUserExists({
          username,
          email,
          id,
        });
        if (user) {
          done(null, false);
        } else {
          done(null, false);
        }
      } catch (error) {
        logger.error(error);
        done(error, false);
      }
    }
  )
);

app.get("/", (req, res, next) => {
  res.json("hi how  r u");
});

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
    console.log("Running at http://localhost:5173");
  });
}
