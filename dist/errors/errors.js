"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BodyValidationError = exports.LoggerApiError = exports.ApiError = void 0;
const logger_1 = require("../logger/logger");
const ERRORS = __importStar(require("../constants/errors"));
const formatMsg = (msg) => (msg ? msg + "" : "");
class ApiError extends Error {
    /**
     *
     * @param status {number}
     * @param msgPrefixOrMsg {string | undefined}
     * @param fullReplace {boolean} - defaults to false, if set true insted of concatanating message it fully replace error message
     */
    constructor(status, msgPrefixOrMsg, fullReplace = false) {
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
        super(fullReplace
            ? msgPrefixOrMsg === null || msgPrefixOrMsg === void 0 ? void 0 : msgPrefixOrMsg.toLocaleLowerCase()
            : errorMsg.toLocaleLowerCase());
        Error.captureStackTrace(this, this.constructor);
        this.status = status;
    }
}
exports.ApiError = ApiError;
/**
 * will logs nothing in production but only developemental
 */
class LoggerApiError extends ApiError {
    constructor(trueError, status, msgPrefixOrMsg, fullReplace = false) {
        super(status, msgPrefixOrMsg !== null && msgPrefixOrMsg !== void 0 ? msgPrefixOrMsg : "error", fullReplace);
        logger_1.logger.error(trueError);
    }
}
exports.LoggerApiError = LoggerApiError;
class BodyValidationError extends Error {
    constructor(errors) {
        super();
        this.message = errors.reduce((accm, error) => accm + error + ";", "");
        this.status = 422;
        this.name = "ValidationError";
    }
}
exports.BodyValidationError = BodyValidationError;
