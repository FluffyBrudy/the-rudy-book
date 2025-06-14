import express from "express";
import expressSession from "express-session";
import cookieParser from "cookie-parser";
import { mainRouter } from "./router/mainRouter";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ExpressUser } from "./types/globalTypes";
import { ApiError } from "./errors/errors";
import { pigeonDb } from "./database/dbClient";
import passport from "passport";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";
import { ROOT } from "./router/routes";

require("dotenv").config();

declare global {
  namespace express {
    interface Request {
      User: ExpressUser | undefined;
    }
  }
}

const app = express();

app.use(cors({ origin: "*", credentials: true })); // todo: filter origin
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(express.json());
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET!,
    cookie: {
      secure: process.env.NODE_ENV == "prod",
      httpOnly: process.env.NODE_ENV == "prod",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.session());

passport.use(
  new Strategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET!,
    },
    async (user: ExpressUser, done) => {
      try {
        const existingUser = await pigeonDb
          .selectFrom("User")
          .select(["User.id", "User.username"])
          .where("User.id", "=", user.id)
          .executeTakeFirst();
        if (existingUser) return done(null, existingUser);
        else return done(new ApiError(404, "user:"), false);
      } catch (error) {
        done(new ApiError(500), false);
      }
    }
  )
);

app.use(ROOT, mainRouter);
app.use(errorHandler());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`listening at port: http://localhost:${PORT}`);
});
