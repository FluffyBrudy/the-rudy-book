import { INTERNAL_SERVER_ERROR } from "../global/errors";
import { logger } from "../logger/logger";
import { User } from "../types/global";
import axios from "axios";

export class PigeonService {
  public static async createUser(
    username: string,
    email: string,
    password: string
  ) {
    try {
      const url = new URL(
        "/auth/register",
        process.env.PIGEON_SERVER
      ).toString();
      const user = await axios.post(url, { username, email, password });
      if ([201, 200].includes(user.status)) {
        return [user, null];
      } else {
        return [null, user.statusText];
      }
    } catch (error) {
      logger.error(error);
      return [null, INTERNAL_SERVER_ERROR];
    }
  }

  public static async getUser(
    email: User["email"],
    password: User["password"]
  ) {
    const url = new URL("/auth/login", process.env.PIGEON_SERVER).toString();
    try {
      const user = await axios.post(url, {
        email,
        password,
      });
      if ([201, 200].includes(user.status)) {
        return [user, null];
      } else {
        return [null, user.statusText];
      }
    } catch (error) {
      logger.error(error);
      return [null, INTERNAL_SERVER_ERROR];
    }
  }
}
