import { Kysely, PostgresDialect } from "kysely";
import { DB as MainDB } from "../types/db/maindb";
import { DB as PigeonDB } from "../types/db/pigeondb";
import { Pool } from "pg";
import { randomUUID } from "crypto";
require("dotenv").config();

export const mainDb = new Kysely<MainDB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL!,
    }),
  }),
});

export const pigeonDb = new Kysely<PigeonDB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.PIGEON_DATABASE_URL!,
    }),
  }),
});
