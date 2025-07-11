import { logger } from "../logger/logger";
import * as ERRORS from "../constants/errors";

const formatMsg = (msg: string | undefined) => (msg ? msg + "" : "");

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
    let errorMsg;

    switch (status) {
      case 400:
        errorMsg = ERRORS.BAD_REQUEST_ERROR;
        break;
      case 422:
        errorMsg = ERRORS.UNPROCESSABLE_ENTITY_ERROR;
        break;
      case 401:
        errorMsg = ERRORS.UNAUTHORIZED_ERROR;
        break;
      case 403:
        errorMsg = ERRORS.FORBIDDEN_ERROR;
        break;
      case 404:
        errorMsg = ERRORS.NOT_FOUND_ERROR;
        break;
      case 409:
        errorMsg = ERRORS.CONFLICT_ERROR;
        break;
      default:
        errorMsg = ERRORS.INTERNAL_SERVER_ERROR;
    }

    errorMsg = formatMsg(msgPrefixOrMsg) + ":" + errorMsg;

    super(
      fullReplace
        ? msgPrefixOrMsg?.toLocaleLowerCase()
        : errorMsg.toLocaleLowerCase()
    );
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
    super(status, msgPrefixOrMsg ?? "error", fullReplace);
    logger.error(trueError);
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

export { ApiError, LoggerApiError, BodyValidationError };
