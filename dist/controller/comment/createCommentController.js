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
exports.CreateCommentController = void 0;
const pg_1 = require("pg");
const yup = __importStar(require("yup"));
const validation_1 = require("../../constants/validation");
const dbClient_1 = require("../../database/dbClient");
const errors_1 = require("../../errors/errors");
const dbCommonQuery_1 = require("../../lib/dbCommonQuery");
const responseWrapper_1 = require("../../utils/responseWrapper");
const logger_1 = require("../../logger/logger");
const notificationSender_1 = require("../../lib/notificationSender");
const CreateCommentSchema = yup
    .object()
    .shape({
    commentBody: yup
        .string()
        .required("comment content can not be empty")
        .trim()
        .min(1, "comment content can not be empty")
        .max(validation_1.MAX_COMMENT_LENGTH),
    postId: yup.number().required("post id is required"),
});
const CreateCommentController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { commentBody, postId } = CreateCommentSchema.validateSync(req.body);
        const { username, id } = req.user;
        const userId = id;
        const userRes = yield (0, dbCommonQuery_1.retrieveProfile)(userId);
        const comment = yield dbClient_1.mainDb
            .insertInto("comment")
            .values({
            commenter_id: userId,
            comment_body: commentBody,
            post_id: postId,
            username: username,
            image_url: (_a = userRes === null || userRes === void 0 ? void 0 : userRes.picture) !== null && _a !== void 0 ? _a : "",
        })
            .returningAll()
            .executeTakeFirst();
        if (!comment)
            return next(new errors_1.ApiError(500, "unable to create comment", true));
        const responseObj = (0, responseWrapper_1.wrapResponse)({
            commentId: comment.comment_id,
            commentorId: userId,
            commentBody: comment.comment_body,
            postId: postId,
            createdAt: comment.created_at,
            username: comment.username,
            profilePicture: comment.image_url,
            totalReaction: 0,
            reactions: [],
        });
        res.status(201).json(responseObj);
        dbClient_1.mainDb
            .selectFrom("post")
            .select("author_id")
            .where("post_id", "=", postId)
            .executeTakeFirst()
            .then((res) => {
            if (!res)
                return;
            const receiverId = res.author_id;
            (0, notificationSender_1.sendNotification)(receiverId, `${username} commented on your post`, postId, validation_1.EReactionOnTypes.POST, req.headers.authorization);
        })
            .catch((err) => logger_1.logger.error(err));
    }
    catch (error) {
        if (error instanceof yup.ValidationError) {
            return next(new errors_1.BodyValidationError(error.errors));
        }
        if (error instanceof pg_1.DatabaseError && error.code === "23503") {
            return next(new errors_1.ApiError(404, "post doesn't exist", true));
        }
        return next(new errors_1.LoggerApiError(error, 500));
    }
});
exports.CreateCommentController = CreateCommentController;
