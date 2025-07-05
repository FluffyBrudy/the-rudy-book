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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetriveNotificationController = void 0;
const dbClient_1 = require("../../database/dbClient");
const responseWrapper_1 = require("../../utils/responseWrapper");
const date_fns_1 = require("date-fns");
const errors_1 = require("../../errors/errors");
const DEFAULT_LIMIT = 10;
const RetriveNotificationController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const notificationPage = parseInt(req.query.page) || 0;
        const notifications = yield dbClient_1.mainDb
            .selectFrom("notification")
            .selectAll()
            .where("user_id", "=", user.id)
            .orderBy("created_at", "desc")
            .offset(notificationPage * DEFAULT_LIMIT)
            .limit(DEFAULT_LIMIT)
            .execute();
        const responseObj = (0, responseWrapper_1.wrapResponse)(notifications.map((notification) => ({
            isRead: notification.is_read,
            userId: notification.user_id,
            notificationOnId: notification.notification_on_id,
            notificationOnType: notification.notification_on_type,
            notificationInfo: notification.notification_info,
            createdAt: (0, date_fns_1.formatDistanceToNow)(notification.created_at, {
                addSuffix: true,
            }),
            notificationId: notification.id,
        })));
        res.status(200).json(responseObj);
    }
    catch (error) {
        return next(new errors_1.LoggerApiError(error, 500));
    }
});
exports.RetriveNotificationController = RetriveNotificationController;
