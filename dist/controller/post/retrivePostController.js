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
exports.RetrivePostController = void 0;
const date_fns_1 = require("date-fns");
const dbClient_1 = require("../../database/dbClient");
const errors_1 = require("../../errors/errors");
const dbQueryFraments_1 = require("../../lib/dbQueryFraments");
const responseWrapper_1 = require("../../utils/responseWrapper");
const RetrivePostController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const user = req.user;
    const postId = (_a = req.params) === null || _a === void 0 ? void 0 : _a.postId;
    if (!postId)
        return next(new errors_1.ApiError(422, "invalid postId", true));
    try {
        const post = yield dbClient_1.mainDb
            .selectFrom("post")
            .leftJoin("media_content", "media_content.post_id", "post.post_id")
            .leftJoin("text_content", "text_content.post_id", "post.post_id")
            .leftJoin("reaction", (join) => join
            .onRef("reaction.reaction_on_id", "=", "post.post_id")
            .on("reaction.reaction_on_type", "=", "post"))
            .selectAll("post")
            .select((eb) => eb.fn.jsonAgg("media_content.media_url").distinct().as("mediaUrls"))
            .select("text_content.content")
            .select([(0, dbQueryFraments_1.totalReactionCount)(), (0, dbQueryFraments_1.aggregatedReactions)()])
            .where("post.post_id", "=", postId)
            .groupBy([
            "post.post_id",
            "post.author_id",
            "post.username",
            "post.image_url",
            "post.created_at",
            "text_content.content",
        ])
            .limit(1)
            .executeTakeFirst();
        if (!post)
            return next(new errors_1.ApiError(404, "post not found", true));
        const response = (0, responseWrapper_1.wrapResponse)({
            authorId: post.author_id,
            postId: post.post_id,
            content: {
                textContent: (_b = post.content) !== null && _b !== void 0 ? _b : undefined,
                mediaContent: ((_c = post.mediaUrls) === null || _c === void 0 ? void 0 : _c.every(Boolean))
                    ? post.mediaUrls
                    : [],
            },
            createdAt: (0, date_fns_1.formatDistanceToNow)(post.created_at, { addSuffix: true }),
            username: post.username,
            profilePicture: post.image_url,
            totalReaction: post.totalReaction,
            reactions: post.reactions,
        });
        res.json(response);
    }
    catch (error) {
        return next(new errors_1.LoggerApiError(error, 500));
    }
});
exports.RetrivePostController = RetrivePostController;
