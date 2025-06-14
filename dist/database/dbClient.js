"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pigeonDb = exports.mainDb = void 0;
const kysely_1 = require("kysely");
const pg_1 = require("pg");
require("dotenv").config();
exports.mainDb = new kysely_1.Kysely({
    dialect: new kysely_1.PostgresDialect({
        pool: new pg_1.Pool({
            connectionString: process.env.DATABASE_URL,
        }),
    }),
});
exports.pigeonDb = new kysely_1.Kysely({
    dialect: new kysely_1.PostgresDialect({
        pool: new pg_1.Pool({
            connectionString: process.env.PIGEON_DATABASE_URL,
        }),
    }),
});
