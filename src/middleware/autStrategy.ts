import {
  ExtractJwt,
  Strategy as JWTStrategy,
  VerifiedCallback,
} from "passport-jwt";
import { logger } from "../logger/logger";
import { ExpressUser } from "../types/global";
import { pigeonDbClient } from "../db/pigeonClient/pigeonClient";

export const authStrategy = () =>
  new JWTStrategy(
    {
      secretOrKey: process.env.JWT_SECRET!,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (payload: ExpressUser, done: VerifiedCallback) => {
      try {
        const { email, id } = payload;
        const user = await pigeonDbClient.user.findUnique({
          where: { email, id },
        });
        if (user) {
          done(null, user);
        } else {
          done(null, false);
        }
      } catch (error) {
        console.error(error);
        logger.error(error);
        done(error, false);
      }
    }
  );
