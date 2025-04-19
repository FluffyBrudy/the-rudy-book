import { connect } from "mongoose";
import { logger } from "../../logger/logger";

export let connected = false;

/**
 * pain in the ass shit for serverless :)
 */
export const connectToDatabase = async (): Promise<void> => {
  if (connected) return;

  try {
    console.log(Date.now());
    await connect(process.env.MAIN_DATABASE_URL!, { bufferCommands: false });
    connected = true;
    logger.info("Connected successfully");
    console.log(Date.now());
  } catch (err) {
    connected = false;
    logger.error(err);
    throw err;
  }
};
