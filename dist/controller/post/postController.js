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
exports.RetrivePostsByIdController = exports.RetrivePostsController = exports.RetrivePostController = exports.CreatePostController = void 0;
const yup = __importStar(require("yup"));
const validation_1 = require("../../constants/validation");
const dbClient_1 = require("../../database/dbClient");
const errors_1 = require("../../errors/errors");
const dbCommonQuery_1 = require("../../lib/dbCommonQuery");
const dbQueryFraments_1 = require("../../lib/dbQueryFraments");
const notificationSender_1 = require("../../lib/notificationSender");
const logger_1 = require("../../logger/logger");
const imageValidation_1 = require("../../utils/imageValidation");
const responseWrapper_1 = require("../../utils/responseWrapper");
const date_fns_1 = require("date-fns");
const PostSchemaValidation = yup.object().shape({
    contents: yup
        .object()
        .shape({
        textContent: yup
            .string()
            .optional()
            .trim()
            .min(1)
            .max(validation_1.MAX_POST_TEXT_LENGTH, `post cannot exceed ${validation_1.MAX_POST_TEXT_LENGTH} characters`),
        mediaContent: yup
            .array()
            .optional()
            .min(1)
            .max(validation_1.MAX_POST_MEDIA_CONTENT_LENGTH, "Maximum media can only be upto 5")
            .of(yup.string().trim().url().required("each element must be valid url")),
    })
        .required("post content is required")
        .test("NoContent", "either text or media must be provided", (value) => {
        var _a;
        const textContent = (_a = value.textContent) === null || _a === void 0 ? void 0 : _a.trim();
        const mediaContent = value.mediaContent;
        if (!textContent && !mediaContent)
            return false;
        return true;
    })
        .test("InvalidMedia", "url must exist and be of media type (image)", (value) => __awaiter(void 0, void 0, void 0, function* () {
        if (!value.mediaContent)
            return true;
        const mediaUrls = value.mediaContent;
        const areUrlsValid = yield (0, imageValidation_1.validateImageURLS)(mediaUrls);
        return areUrlsValid;
    })),
});
const CreatePostController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { contents } = yield PostSchemaValidation.validate(req.body);
        const user = req.user; // i am sure because this always  happend in authentication middleware
        const response = yield dbClient_1.mainDb.transaction().execute((trx) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const insertionPromise = [];
            const userProfile = yield (0, dbCommonQuery_1.retrieveProfile)(user.id);
            const postReponse = yield trx
                .insertInto("post")
                .values({
                author_id: user.id,
                username: user.username,
                image_url: (_a = userProfile === null || userProfile === void 0 ? void 0 : userProfile.picture) !== null && _a !== void 0 ? _a : "",
            })
                .returningAll()
                .executeTakeFirstOrThrow();
            const postId = postReponse.post_id;
            const response = {
                username: user.username,
                profilePicture: (_b = userProfile === null || userProfile === void 0 ? void 0 : userProfile.picture) !== null && _b !== void 0 ? _b : "",
                authorId: user.id,
                postId: postId,
                content: {},
                totalReaction: 0,
                createdAt: (0, date_fns_1.formatDistanceToNow)(postReponse.created_at, {
                    addSuffix: true,
                }),
                reactions: [],
            };
            if (contents.textContent) {
                const textContentPromise = trx
                    .insertInto("text_content")
                    .values({
                    content: contents.textContent,
                    post_id: postId,
                })
                    .returning("content")
                    .executeTakeFirst()
                    .then((textContent) => {
                    if (!textContent) {
                        throw new Error("unable to insert text content");
                    }
                    response.content.textContent = textContent.content;
                });
                insertionPromise.push(textContentPromise);
            }
            if (contents.mediaContent) {
                const mediaContentPromise = trx
                    .insertInto("media_content")
                    .values(contents.mediaContent.map((value) => ({
                    post_id: postId,
                    media_url: value,
                })))
                    .returning("media_url")
                    .execute()
                    .then((mediaContent) => {
                    if (!mediaContent) {
                        throw new Error("unable to insert media content");
                    }
                    response.content.mediaContent = mediaContent.map(({ media_url }) => media_url);
                });
                insertionPromise.push(mediaContentPromise);
            }
            yield Promise.all(insertionPromise);
            return response;
        }));
        const responseObj = (0, responseWrapper_1.wrapResponse)(response);
        res.status(200).json(responseObj);
        (0, dbCommonQuery_1.retrieveAcceptedFriendship)(user.id)
            .then((res) => {
            if (res.length === 0)
                return;
            const message = `${user.username} has a new post.`;
            const notificationPromises = res.map((receiverId) => (0, notificationSender_1.sendNotification)(receiverId, message, response.postId, validation_1.EReactionOnTypes.POST, req.headers.authorization));
            Promise.allSettled(notificationPromises);
        })
            .catch((err) => logger_1.logger.error(err));
    }
    catch (error) {
        if (error instanceof yup.ValidationError) {
            return next(new errors_1.BodyValidationError(error.errors));
        }
        return next(new errors_1.LoggerApiError(error, 500));
    }
});
exports.CreatePostController = CreatePostController;
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
const RetrivePostsController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    try {
        const friendsId = yield (0, dbCommonQuery_1.retrieveAcceptedFriendship)(user.id);
        const postFetchPromises = yield Promise.all([
            (0, dbCommonQuery_1.retrivePosts)(user.id, friendsId),
            retriveRandomPostByReactionEngagement([user.id, ...friendsId]),
        ]);
        const filteredPost = postFetchPromises.filter(Boolean);
        const posts = filteredPost.reduce((accm, post) => accm.concat(post), []);
        // shuffle(filteredPost);
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
const RetrivePostsByIdController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const targetId = req.params.userId;
    if (!targetId)
        return next(new errors_1.BodyValidationError(["user id is required"]));
    try {
        const userId = yup
            .string()
            .required()
            .uuid("user id must be valid id")
            .validateSync(targetId);
        const response = yield (0, dbCommonQuery_1.retrivePosts)(user.id, [userId], false);
        if (!response) {
            return next(new errors_1.ApiError(500, "unable to retrive post", true));
        }
        const filteredPost = response === null || response === void 0 ? void 0 : response.filter(Boolean);
        const posts = filteredPost === null || filteredPost === void 0 ? void 0 : filteredPost.reduce((accm, post) => accm.concat(post), []);
        const responseObj = (0, responseWrapper_1.wrapResponse)(posts);
        res.status(200).json(responseObj);
    }
    catch (error) {
        if (error instanceof yup.ValidationError)
            return next(new errors_1.BodyValidationError(error.errors));
        return next(new errors_1.LoggerApiError(error, 500));
    }
});
exports.RetrivePostsByIdController = RetrivePostsByIdController;
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
