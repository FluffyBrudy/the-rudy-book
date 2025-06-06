import { Kysely, PostgresDialect } from "kysely";
import { DB } from "../types/db/db";
import { Pool } from "pg";
import { randomUUID } from "crypto";
require("dotenv").config();

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL!,
    }),
  }),
});

async function main() {
  const uuid: string = randomUUID();

  const userInsertion = await db
    .insertInto("post")
    .values({
      author_id: uuid,
      post_id: 6,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .returningAll()
    .execute();
  console.log(userInsertion);
}

main().catch((err) => console.error((err as Error).message));
