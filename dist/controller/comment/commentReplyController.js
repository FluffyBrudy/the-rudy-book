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
exports.RetriveCommentReplyController = exports.RetriveCommentRepliesController = exports.CreateCommentReplyController = void 0;
const pg_1 = require("pg");
const yup = __importStar(require("yup"));
const validation_1 = require("../../constants/validation");
const dbClient_1 = require("../../database/dbClient");
const errors_1 = require("../../errors/errors");
const dbCommonQuery_1 = require("../../lib/dbCommonQuery");
const dbQueryFraments_1 = require("../../lib/dbQueryFraments");
const notificationSender_1 = require("../../lib/notificationSender");
const logger_1 = require("../../logger/logger");
const responseWrapper_1 = require("../../utils/responseWrapper");
const date_fns_1 = require("date-fns");
const ReplyRetriveSchema = yup.object().shape({
    parentCommentId: yup.number().required("comment id is required"),
});
const CommentReplySchema = yup
    .object()
    .shape({
    replyContent: yup
        .string()
        .required("reply must not be empty")
        .trim()
        .min(1, "reply must not be empty"),
})
    .concat(ReplyRetriveSchema);
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
const RetriveCommentRepliesController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parentCommentId } = ReplyRetriveSchema.validateSync(req.body);
        const replies = yield dbClient_1.mainDb
            .selectFrom("comment_reply")
            .leftJoin("reaction", (join) => join
            .onRef("reaction.reaction_on_id", "=", "comment_reply.comment_reply_id")
            .on("reaction.reaction_on_type", "=", "reply"))
            .selectAll("comment_reply")
            .select([(0, dbQueryFraments_1.totalReactionCount)(), (0, dbQueryFraments_1.aggregatedReactions)()])
            .where("comment_reply.parent_comment_id", "=", parentCommentId)
            .groupBy([
            "comment_reply.comment_reply_id",
            "comment_reply.created_at",
            "comment_reply.udpated_at",
            "comment_reply.image_url",
            "comment_reply.username",
            "comment_reply.replied_by_id",
            "comment_reply.parent_comment_id",
            "comment_reply.reply_content",
        ])
            .orderBy("created_at", "desc")
            .execute();
        const responseObjs = (0, responseWrapper_1.wrapResponse)(replies.map((reply) => {
            var _a, _b;
            return ({
                commentReplyId: reply.comment_reply_id,
                createdAt: (0, date_fns_1.formatDistanceToNow)(reply.created_at, { addSuffix: true }),
                profilePicture: (_a = reply.image_url) !== null && _a !== void 0 ? _a : "",
                parentCommentId: reply.parent_comment_id,
                repliedById: reply.replied_by_id,
                replyContent: reply.reply_content,
                updatedAt: reply.udpated_at,
                username: (_b = reply.username) !== null && _b !== void 0 ? _b : "",
                totalReaction: reply.totalReaction,
                reactions: reply.reactions,
            });
        }));
        res.status(200).json(responseObjs);
    }
    catch (error) {
        if (error instanceof yup.ValidationError) {
            return next(new errors_1.BodyValidationError(error.errors));
        }
        return next(new errors_1.LoggerApiError(error, 500));
    }
});
exports.RetriveCommentRepliesController = RetriveCommentRepliesController;
const RetriveCommentReplyController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = req.user;
    const commentReplyId = (_a = req.params) === null || _a === void 0 ? void 0 : _a.commentReplyId;
    if (!commentReplyId)
        return next(new errors_1.ApiError(422, "invalid reply id", true));
    try {
        const reply = yield dbClient_1.mainDb
            .selectFrom("comment_reply")
            .leftJoin("reaction", (join) => join
            .onRef("reaction.reaction_on_id", "=", "comment_reply.comment_reply_id")
            .on("reaction.reaction_on_type", "=", "reply"))
            .innerJoin("comment", "comment.comment_id", "comment_reply.parent_comment_id")
            .selectAll("comment_reply")
            .select("comment.post_id")
            .select([(0, dbQueryFraments_1.totalReactionCount)(), (0, dbQueryFraments_1.aggregatedReactions)()])
            .where("comment_reply.comment_reply_id", "=", commentReplyId)
            .groupBy([
            "comment_reply.parent_comment_id",
            "comment_reply.comment_reply_id",
            "comment_reply.username",
            "comment_reply.image_url",
            "comment_reply.created_at",
            "comment.post_id",
        ])
            .limit(1)
            .executeTakeFirst();
        if (!reply)
            return next(new errors_1.ApiError(404, "comment not found", true));
        const response = (0, responseWrapper_1.wrapResponse)({
            commentReplyId: reply.comment_reply_id,
            repliedById: reply.replied_by_id,
            postId: reply.post_id,
            replyContent: reply.reply_content,
            createdAt: (0, date_fns_1.formatDistanceToNow)(reply.created_at, { addSuffix: true }),
            username: reply.username,
            profilePicture: reply.image_url,
            totalReaction: reply.totalReaction,
            reactions: reply.reactions,
            parentCommentId: reply.parent_comment_id,
        });
        res.json(response);
    }
    catch (error) {
        return next(new errors_1.LoggerApiError(error, 500));
    }
});
exports.RetriveCommentReplyController = RetriveCommentReplyController;
