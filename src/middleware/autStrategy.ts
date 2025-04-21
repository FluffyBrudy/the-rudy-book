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
          select: {
            username: true,
            email: true,
            id: true,
            Profile: { select: { picture: true } },
          },
        });
        if (user) {
          const { username, email, id, Profile } = user;
          done(null, { username, email, id, imageUrl: Profile!.picture });
        } else {
          done(null, false);
        }
      } catch (error) {
        logger.error(error);
        done(error, false);
      }
    }
  );
