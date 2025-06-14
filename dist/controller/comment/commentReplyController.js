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
exports.RetriveCommentRepliesController = exports.CreateCommentReplyController = void 0;
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
    const user = req.user; // replied_by_id
    try {
        const { parentCommentId, replyContent } = CommentReplySchema.validateSync(req.body);
        const profile = yield (0, dbCommonQuery_1.retrieveProfile)(user.id);
        const commentReply = yield dbClient_1.mainDb
            .insertInto("comment_reply")
            .values({
            parent_comment_id: parentCommentId, // again im notchecking because error come from db for fkey violation if comment doesnt exist
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
            createdAt: commentReply.created_at,
            profilePicture: commentReply.image_url,
            parentCommentId: commentReply.parent_comment_id,
            repliedById: commentReply.replied_by_id,
            replyContent: commentReply.reply_content,
            updatedAt: commentReply.udpated_at,
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
            (0, notificationSender_1.sendNotification)(receiverId, notificationMsg, parentCommentId, validation_1.EReactionOnTypes.COMMENT, req.headers.authorization);
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
                createdAt: reply.created_at,
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
