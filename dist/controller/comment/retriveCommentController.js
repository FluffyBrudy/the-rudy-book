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
exports.RetriveCommentController = void 0;
const dbClient_1 = require("../../database/dbClient");
const errors_1 = require("../../errors/errors");
const dbQueryFraments_1 = require("../../lib/dbQueryFraments");
const responseWrapper_1 = require("../../utils/responseWrapper");
const date_fns_1 = require("date-fns");
const RetriveCommentController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = req.user;
    const commentId = (_a = req.params) === null || _a === void 0 ? void 0 : _a.commentId;
    if (!commentId)
        return next(new errors_1.ApiError(422, "invalid postId", true));
    try {
        const comment = yield dbClient_1.mainDb
            .selectFrom("comment")
            .leftJoin("reaction", (join) => join
            .onRef("reaction.reaction_on_id", "=", "comment.comment_id")
            .on("reaction.reaction_on_type", "=", "comment"))
            .selectAll("comment")
            .select([(0, dbQueryFraments_1.totalReactionCount)(), (0, dbQueryFraments_1.aggregatedReactions)()])
            .where("comment.comment_id", "=", commentId)
            .groupBy([
            "comment.post_id",
            "comment.comment_id",
            "comment.username",
            "comment.image_url",
            "comment.created_at",
        ])
            .limit(1)
            .executeTakeFirst();
        if (!comment)
            return next(new errors_1.ApiError(400, "comment not found", true));
        const response = (0, responseWrapper_1.wrapResponse)({
            commentId: comment.comment_id,
            commentorId: comment.commenter_id,
            postId: comment.post_id,
            commentBody: comment.comment_body,
            createdAt: (0, date_fns_1.formatDistanceToNow)(comment.created_at, { addSuffix: true }),
            username: comment.username,
            profilePicture: comment.image_url,
            totalReaction: comment.totalReaction,
            reactions: comment.reactions,
        });
        res.json(response);
    }
    catch (error) {
        return next(new errors_1.LoggerApiError(error, 500));
    }
});
exports.RetriveCommentController = RetriveCommentController;
