import { logger } from "../logger/logger";
import * as ERRORS from "../global/errorMessage";
import { MongoError } from "mongodb";

const formatMsg = (msg: string | undefined) => (msg ? msg + " " : "");

class ApiError extends Error {
  public status: number;
  /**
   *
   * @param status {number}
   * @param msgPrefixOrMsg {string | undefined}
   * @param fullReplace {boolean} - defaults to false, if set true insted of concatanating message it fully replace error message
   */
  constructor(
    status: number,
    msgPrefixOrMsg?: string,
    fullReplace: boolean = false
  ) {
    let errorMsg = formatMsg(msgPrefixOrMsg);

    switch (status) {
      case 400:
        errorMsg += ERRORS.BAD_REQUEST_ERROR;
        break;
      case 422:
        errorMsg += ERRORS.UNPROCESSABLE_ENTITY_ERROR;
        break;
      case 401:
        errorMsg += ERRORS.UNAUTHORIZED_ERROR;
        break;
      case 403:
        errorMsg += ERRORS.FORBIDDEN_ERROR;
        break;
      case 404:
        errorMsg += ERRORS.NOT_FOUND_ERROR;
        break;
      case 409:
        errorMsg += ERRORS.CONFLICT_ERROR;
        break;
      default:
        errorMsg = ERRORS.INTERNAL_SERVER_ERROR;
    }

    super(fullReplace ? msgPrefixOrMsg : errorMsg);
    Error.captureStackTrace(this, this.constructor);
    this.status = status;
  }
}
/**
 * will logs nothing in production but only developemental
 */
class LoggerApiError extends ApiError {
  constructor(
    trueError: any,
    status: number,
    msgPrefixOrMsg?: string,
    fullReplace: boolean = false
  ) {
    super(status, msgPrefixOrMsg, fullReplace);
    if (process.env.NODE_ENV !== "prod") {
      logger.error(trueError);
    }
  }
}

class BodyValidationError extends Error {
  public status: number;
  constructor(errors: string[]) {
    super();
    this.message = errors.reduce((accm, error) => accm + error + ";", "");
    this.status = 422;
    this.name = "ValidationError";
  }
}

function isMongError(error: any): error is MongoError {
  return (
    typeof error === "object" &&
    error != null &&
    typeof error.hasErrorLabel === "function"
  );
}

export { ApiError, LoggerApiError, BodyValidationError, isMongError };
