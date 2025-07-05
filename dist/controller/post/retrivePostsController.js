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
exports.RetrivePostsController = void 0;
const date_fns_1 = require("date-fns");
const dbCommonQuery_1 = require("../../lib/dbCommonQuery");
const dbCommonQuery_2 = require("../../lib/dbCommonQuery");
const errors_1 = require("../../errors/errors");
const responseWrapper_1 = require("../../utils/responseWrapper");
const logger_1 = require("../../logger/logger");
const dbClient_1 = require("../../database/dbClient");
const dbQueryFraments_1 = require("../../lib/dbQueryFraments");
const RetrivePostsController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    try {
        const friendsId = yield (0, dbCommonQuery_1.retrieveAcceptedFriendship)(user.id);
        const postFetchPromises = yield Promise.all([
            (0, dbCommonQuery_2.retrivePosts)(user.id, friendsId),
            retriveRandomPostByReactionEngagement([user.id, ...friendsId]),
        ]);
        const filteredPost = postFetchPromises.filter(Boolean);
        const posts = filteredPost.reduce((accm, post) => accm.concat(post), []);
        if (!posts)
            return next(new errors_1.ApiError(500, "unable to retrive post", true));
        const responseObj = (0, responseWrapper_1.wrapResponse)(posts);
        res.status(200).json(responseObj);
    }
    catch (error) {
        return next(new errors_1.LoggerApiError(error, 500));
    }
});
exports.RetrivePostsController = RetrivePostsController;
function retriveRandomPostByReactionEngagement(omitableIds) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const posts = yield dbClient_1.mainDb
                .selectFrom("post")
                .leftJoin("reaction", (join) => join
                .onRef("reaction.reaction_on_id", "=", "post.post_id")
                .on("reaction.reaction_on_type", "=", "post"))
                .leftJoin("text_content", "text_content.post_id", "post.post_id")
                .leftJoin("media_content", "media_content.post_id", "post.post_id")
                .selectAll("post")
                .select((eb) => eb.fn.jsonAgg("media_content.media_url").distinct().as("mediaUrls"))
                .select([(0, dbQueryFraments_1.totalReactionCount)(), (0, dbQueryFraments_1.aggregatedReactions)()])
                .select("text_content.content")
                .where("author_id", "not in", [...omitableIds])
                .groupBy([
                "post.post_id",
                "post.author_id",
                "post.created_at",
                "post.updated_at",
                "post.image_url",
                "post.username",
                "text_content.content",
            ])
                .orderBy("totalReaction", "desc")
                .limit(50)
                .execute();
            return posts.map((post) => {
                var _a;
                return ({
                    authorId: post.author_id,
                    postId: post.post_id,
                    content: {
                        textContent: post.content,
                        mediaContent: ((_a = post.mediaUrls) === null || _a === void 0 ? void 0 : _a.every(Boolean)) ? post.mediaUrls : [],
                    },
                    createdAt: (0, date_fns_1.formatDistanceToNow)(post.created_at, { addSuffix: true }),
                    username: post.username,
                    profilePicture: post.image_url,
                    totalReaction: post.totalReaction,
                    reactions: post.reactions,
                });
            });
        }
        catch (error) {
            logger_1.logger.error(error);
            return null;
        }
    });
}
