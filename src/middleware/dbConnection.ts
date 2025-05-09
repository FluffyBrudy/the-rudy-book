import { connectToDatabase, connected } from "../db/mongoClient/mongoClient";
import { RequestHandler } from "express";
import { LoggerApiError } from "../errors/errors";

export const verifyDbConnection: RequestHandler = async (_, __, next) => {
  try {
    if (!connected) {
      await connectToDatabase();
    }
    next();
  } catch (error) {
    console.log(error);
    return next(new LoggerApiError(error, 500));
  }
};
