import { Pool } from "pg";
import { ExpressUser } from "../types/global";
import { logger } from "../logger/logger";

export class PigeonDbClient {
  private static instance: Pool | null = null;

  private constructor() {}

  public static getInstance(): Pool {
    if (!PigeonDbClient.instance) {
      const databaseUrl = process.env.PIGEON_DATABASE_URL;
      if (!databaseUrl) {
        throw new Error("PIGEON_DATABASE_URL environment variable is not set");
      }
      PigeonDbClient.instance = new Pool({
        connectionString: databaseUrl,
      });
    }
    return PigeonDbClient.instance;
  }

  public static async registerUser(
    username: string,
    email: string,
    password: string
  ) {
    const db = PigeonDbClient.getInstance();
    const query = {
      text: 'INSERT INTO "User"(username, email, password) VALUES($1, $2, $3)',
      values: [username, email, password],
    };
    try {
      return (await db.query(query)).rows[0];
    } catch (error) {
      return error;
    }
  }

  public static async checkUserExists(
    user: ExpressUser | Omit<ExpressUser, "username">
  ) {
    const db = PigeonDbClient.getInstance();
    const query = {
      text: 'SELECT user."username", user."email", user."id" FROM "User" as user WHERE id = $1 AND email = $2 AND username = $3',
      values: [user.id, user.email],
    };
    try {
      const dbResponse = await db.query(query);
      if (dbResponse.rowCount === 0) return null;
      return dbResponse.rows[0] as {
        username: string;
        email: string;
        id: string;
      };
    } catch (error) {
      logger.error(error);
      return null;
    }
  }
}
