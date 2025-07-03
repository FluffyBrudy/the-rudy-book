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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.ToggleNotificationReadStatus = exports.DeleteNotificationController = exports.RetriveNotificationController = void 0;
const yup = __importStar(require("yup"));
const dbClient_1 = require("../../database/dbClient");
const responseWrapper_1 = require("../../utils/responseWrapper");
const date_fns_1 = require("date-fns");
const errors_1 = require("../../errors/errors");
const pg_1 = require("pg");
const kysely_1 = require("kysely");
const NotificationDeleteSchema = yup.object().shape({
    notificationIds: yup
        .array()
        .required("notification ids are required")
        .of(yup
        .number()
        .required("at least one id is required")
        .positive("invalid id")),
});
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
const DeleteNotificationController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { notificationIds } = NotificationDeleteSchema.validateSync(req.body);
        const response = yield dbClient_1.mainDb
            .deleteFrom("notification")
            .where("notification.id", "in", notificationIds)
            .execute();
        res.json((0, responseWrapper_1.wrapResponse)({ count: response.length }));
    }
    catch (error) {
        if (error instanceof yup.ValidationError) {
            return next(new errors_1.BodyValidationError(error.errors));
        }
        return next(new errors_1.LoggerApiError(error, 500));
    }
});
exports.DeleteNotificationController = DeleteNotificationController;
const ToggleNotificationReadStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { notificationId } = yup
            .object()
            .shape({
            notificationId: yup
                .number()
                .required("notification identifier is required"),
        })
            .validateSync(req.body);
        const notification = yield dbClient_1.mainDb
            .updateTable("notification")
            .where("notification.id", "=", notificationId)
            .set({
            is_read: (0, kysely_1.sql) `NOT is_read`,
        })
            .returning("is_read")
            .executeTakeFirst();
        res.json((0, responseWrapper_1.wrapResponse)({
            isRead: (_a = notification === null || notification === void 0 ? void 0 : notification.is_read) !== null && _a !== void 0 ? _a : false,
        }));
    }
    catch (error) {
        if (error instanceof yup.ValidationError) {
            return next(new errors_1.BodyValidationError(error.errors));
        }
        if (error instanceof pg_1.DatabaseError && error.code === "23503") {
            return next(new errors_1.ApiError(404, "notification not found", true));
        }
        return next(new errors_1.LoggerApiError(error, 500));
    }
});
exports.ToggleNotificationReadStatus = ToggleNotificationReadStatus;
