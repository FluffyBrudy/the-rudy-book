import { ClientSession, Db, MongoClient, ServerApiVersion } from "mongodb";
import { isMongError } from "../../errors/errors";
import { logger } from "../../logger/logger";

import { config } from "dotenv";
config();
const MONGO_DB_NAME = "the-rudy-book";

export enum COLLECTIONS {
  POST = "posts",
  COMMENT = "comments",
  USER_REACTION = "reactions",
}
export let connected = false;
export let mongoClientDb: Db;

let mongoClient: MongoClient;

/**
 * pain in the ass shit for serverless :)
 */
export const connectToDatabase = async (): Promise<void> => {
  if (connected) return;

  try {
    mongoClient = new MongoClient(process.env.MAIN_DATABASE_URL!, {
      serverApi: {
        version: ServerApiVersion.v1,
        deprecationErrors: true,
        strict: true,
      },
    });
    await mongoClient.connect();
    mongoClientDb = mongoClient.db(MONGO_DB_NAME);
    connected = true;
    logger.info("Connected successfully");
  } catch (err) {
    connected = false;
    logger.error(err);
    throw err;
  }
};

export const performTransection = async (
  operation: (session: ClientSession) => Promise<void>
) => {
  const session = mongoClient.startSession();

  const status = {
    success: false,
    error: null as null | string,
    cause: null as string | null | undefined,
  };

  try {
    session.startTransaction();
    await operation(session);
    await session.commitTransaction();
    logger.info("Session committed");
    status.success = true;
  } catch (error) {
    logger.error(error);
    await safeAbortTransaction(session);
    if (isMongError(error)) {
      status.error = error.message;
      status.cause = error.cause?.message;
    } else {
      status.error = (error as Error).message;
    }
  } finally {
    session.endSession();
  }
  return status;
};

async function safeAbortTransaction(session: ClientSession) {
  try {
    await session.abortTransaction();
    logger.info("Session aborted");
  } catch (abortError) {
    logger.error(abortError);
  }
}
