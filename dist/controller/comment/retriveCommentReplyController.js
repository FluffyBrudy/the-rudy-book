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
exports.RetriveCommentReplyController = void 0;
const dbClient_1 = require("../../database/dbClient");
const errors_1 = require("../../errors/errors");
const dbQueryFraments_1 = require("../../lib/dbQueryFraments");
const responseWrapper_1 = require("../../utils/responseWrapper");
const date_fns_1 = require("date-fns");
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
