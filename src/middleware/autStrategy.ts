import {
  ExtractJwt,
  Strategy as JWTStrategy,
  VerifiedCallback,
} from "passport-jwt";
import { PigeonDbClient } from "../db/pigeonDbClient";
import { logger } from "../logger/logger";
import { ExpressUser } from "../types/global";

export const authStrategy = () =>
  new JWTStrategy(
    {
      secretOrKey: process.env.JWT_SECRET!,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    },
    async (payload: ExpressUser, done: VerifiedCallback) => {
      try {
        const { email, id } = payload;
        const user = await PigeonDbClient.checkUserExists({
          email,
          id,
        });
        if (user) {
          done(null, user);
        } else {
          done(null, false);
        }
      } catch (error) {
        logger.error(error);
        done(error, false);
      }
    }
  );
