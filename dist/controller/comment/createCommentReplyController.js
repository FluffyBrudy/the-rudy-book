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
exports.CreateCommentReplyController = void 0;
const pg_1 = require("pg");
const yup = __importStar(require("yup"));
const validation_1 = require("../../constants/validation");
const dbClient_1 = require("../../database/dbClient");
const errors_1 = require("../../errors/errors");
const dbCommonQuery_1 = require("../../lib/dbCommonQuery");
const notificationSender_1 = require("../../lib/notificationSender");
const logger_1 = require("../../logger/logger");
const responseWrapper_1 = require("../../utils/responseWrapper");
const date_fns_1 = require("date-fns");
const CommentReplySchema = yup
    .object()
    .shape({
    replyContent: yup
        .string()
        .required("reply must not be empty")
        .trim()
        .min(1, "reply must not be empty"),
    parentCommentId: yup.number().required("comment id is required"),
});
const CreateCommentReplyController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = req.user;
    try {
        const { parentCommentId, replyContent } = CommentReplySchema.validateSync(req.body);
        const profile = yield (0, dbCommonQuery_1.retrieveProfile)(user.id);
        const commentReply = yield dbClient_1.mainDb
            .insertInto("comment_reply")
            .values({
            parent_comment_id: parentCommentId,
            replied_by_id: user.id,
            reply_content: replyContent,
            username: user.username,
            image_url: (_a = profile === null || profile === void 0 ? void 0 : profile.picture) !== null && _a !== void 0 ? _a : "",
        })
            .returningAll()
            .executeTakeFirst();
        if (!commentReply)
            return next(new errors_1.ApiError(500, "unable to create reply", true));
        const responseObj = (0, responseWrapper_1.wrapResponse)({
            commentReplyId: commentReply.comment_reply_id,
            createdAt: (0, date_fns_1.formatDistanceToNow)(commentReply.created_at, {
                addSuffix: true,
            }),
            profilePicture: commentReply.image_url,
            parentCommentId: commentReply.parent_comment_id,
            repliedById: commentReply.replied_by_id,
            replyContent: commentReply.reply_content,
            username: user.username,
            totalReaction: 0,
            reactions: [],
        });
        res.status(201).json(responseObj);
        dbClient_1.mainDb
            .selectFrom("comment")
            .where("comment_id", "=", parentCommentId)
            .select("commenter_id")
            .executeTakeFirstOrThrow()
            .then((res) => {
            const notificationMsg = `${user.username} replied to your comment`;
            const receiverId = res.commenter_id;
            (0, notificationSender_1.sendNotification)(receiverId, notificationMsg, commentReply.comment_reply_id, validation_1.EReactionOnTypes.REPLY, req.headers.authorization);
        })
            .catch((err) => logger_1.logger.error(err));
    }
    catch (error) {
        if (error instanceof yup.ValidationError) {
            return next(new errors_1.BodyValidationError(error.errors));
        }
        if (error instanceof pg_1.DatabaseError && error.code === "23503") {
            return next(new errors_1.ApiError(404, "comment doesnt exist", true));
        }
        return next(new errors_1.LoggerApiError(error, 500));
    }
});
exports.CreateCommentReplyController = CreateCommentReplyController;
