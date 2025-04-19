import { connect } from "mongoose";
import { logger } from "../../logger/logger";

export let connected = false;

/**
 * pain in the ass shit for serverless :)
 */
export const connectToDatabase = async (): Promise<void> => {
  if (connected) return;

  try {
    await connect(process.env.MAIN_DATABASE_URL!, { bufferCommands: false });
    connected = true;
    logger.info("Connected successfully");
  } catch (err) {
    connected = false;
    logger.error(err);
    throw err;
  }
};
