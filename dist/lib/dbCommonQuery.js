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
exports.checkPostExist = checkPostExist;
exports.retrieveProfile = retrieveProfile;
exports.createNotification = createNotification;
exports.retrieveAcceptedFriendship = retrieveAcceptedFriendship;
exports.checkTargetExist = checkTargetExist;
exports.retrivePosts = retrivePosts;
const kysely_1 = require("kysely");
const logger_1 = require("../logger/logger");
const dbClient_1 = require("../database/dbClient");
const validation_1 = require("../constants/validation");
const dbQueryFraments_1 = require("./dbQueryFraments");
function checkPostExist(postId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const postExist = yield dbClient_1.mainDb
                .selectFrom("post")
                .select((0, kysely_1.sql) `1`.as("dummy"))
                .where("post_id", "=", postId)
                .execute();
            return !!postExist;
        }
        catch (error) {
            logger_1.logger.error(error);
            return false;
        }
    });
}
function retrieveProfile(userId_1) {
    return __awaiter(this, arguments, void 0, function* (userId, fields = { picture: true }) {
        const selectableFields = Object.keys(fields).filter((field) => fields[field]);
        if (selectableFields.length === 0)
            throw new Error("fields for profile retrieval should not be empty");
        const profile = yield dbClient_1.pigeonDb
            .selectFrom("Profile")
            .select(selectableFields)
            .where("userId", "=", userId)
            .limit(1)
            .executeTakeFirst();
        return profile;
    });
}
function createNotification(receiverId, notificationInfo, notificationOnId, notificationOnType) {
    return __awaiter(this, void 0, void 0, function* () {
        const notification = yield dbClient_1.mainDb
            .insertInto("notification")
            .values({
            user_id: receiverId,
            notification_info: notificationInfo,
            notification_on_id: notificationOnId,
            notification_on_type: notificationOnType,
        })
            .returningAll()
            .executeTakeFirstOrThrow();
        return notification;
    });
}
function retrieveAcceptedFriendship(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        return (yield dbClient_1.pigeonDb
            .selectFrom("AcceptedFriendship")
            .select((eb) => eb
            .case()
            .when("userId1", "=", userId)
            .then(eb.ref("userId2"))
            .else(eb.ref("userId1"))
            .end()
            .as("friendId"))
            .where((eb) => eb.or([eb("userId1", "=", userId), eb("userId2", "=", userId)]))
            .execute()).map(({ friendId }) => friendId);
    });
}
function checkTargetExist(reactionOnType, targetId) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (reactionOnType) {
            case validation_1.EReactionOnTypes.COMMENT:
                const commentExists = yield dbClient_1.mainDb
                    .selectFrom("comment")
                    .select("comment.commenter_id")
                    .where("comment.comment_id", "=", targetId)
                    .executeTakeFirstOrThrow();
                return commentExists.commenter_id;
            case validation_1.EReactionOnTypes.POST:
                const postExists = yield dbClient_1.mainDb
                    .selectFrom("post")
                    .select("author_id")
                    .where("post.post_id", "=", targetId)
                    .executeTakeFirstOrThrow();
                return postExists.author_id;
            case validation_1.EReactionOnTypes.REPLY:
                const replyExists = yield dbClient_1.mainDb
                    .selectFrom("comment_reply")
                    .select("replied_by_id")
                    .where("comment_reply.comment_reply_id", "=", targetId)
                    .executeTakeFirstOrThrow();
                return replyExists.replied_by_id;
            default:
                return null;
        }
    });
}
function retrivePosts(userId_1, targetIds_1) {
    return __awaiter(this, arguments, void 0, function* (userId, targetIds, includeUser = true, cursor = new Date()) {
        const other = includeUser ? [userId] : [];
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
                .where("author_id", "in", [...targetIds, ...other])
                .where("post.created_at", "<", cursor)
                .groupBy([
                "post.post_id",
                "post.author_id",
                "post.created_at",
                "post.updated_at",
                "post.image_url",
                "post.username",
                "text_content.content",
            ])
                .orderBy("created_at", "desc")
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
                    createdAt: post.created_at,
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
