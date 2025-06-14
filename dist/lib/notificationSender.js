"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../logger/logger");
const dbCommonQuery_1 = require("./dbCommonQuery");
function sendNotification(receiverId, notificationInfo, notificationOnId, notificationOnType, bearerToken) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (0, dbCommonQuery_1.createNotification)(receiverId, notificationInfo, notificationOnId, notificationOnType);
            if (!data)
                return;
            const sockData = {
                receiverId,
                notificationInfo,
                notificationOnId,
                notificationOnType,
            };
            const response = yield axios_1.default.post(process.env.SOCKET_SERVER, Object.assign({}, sockData), {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: bearerToken,
                },
            });
            if (response.status !== 200) {
                logger_1.logger.error({
                    error: `[${response.status}][${response.statusText}]: unable to send notification"`,
                });
            }
        }
        catch (error) {
            logger_1.logger.error(error);
        }
    });
}
exports.sendNotification = sendNotification;
