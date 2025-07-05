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
exports.RetriveCommentsController = void 0;
const yup = __importStar(require("yup"));
const dbCommonQuery_1 = require("../../lib/dbCommonQuery");
const dbClient_1 = require("../../database/dbClient");
const errors_1 = require("../../errors/errors");
const dbQueryFraments_1 = require("../../lib/dbQueryFraments");
const responseWrapper_1 = require("../../utils/responseWrapper");
const date_fns_1 = require("date-fns");
const RetriveCommentSchema = yup.object().shape({
    postId: yup.number().required("post id is required"),
});
const RetriveCommentsController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = RetriveCommentSchema.validateSync(req.body);
        const userId = req.user.id;
        if (!(yield (0, dbCommonQuery_1.checkPostExist)(postId)))
            return next(new errors_1.ApiError(404, "post doesnt exist", true));
        const comments = yield dbClient_1.mainDb
            .selectFrom("comment")
            .leftJoin("reaction", (join) => join
            .onRef("reaction.reaction_on_id", "=", "comment.comment_id")
            .on("reaction.reaction_on_type", "=", "comment"))
            .select([
            "comment.comment_id",
            "comment.comment_body",
            "comment.commenter_id",
            "comment.created_at",
            "comment.post_id",
            "comment.username",
            "comment.image_url",
            (0, dbQueryFraments_1.totalReactionCount)(),
            (0, dbQueryFraments_1.aggregatedReactions)(),
        ])
            .where("comment.post_id", "=", postId)
            .groupBy([
            "comment.comment_id",
            "comment.comment_body",
            "comment.commenter_id",
            "comment.created_at",
            "comment.post_id",
            "comment.username",
            "comment.image_url",
        ])
            .execute();
        const responseObjs = (0, responseWrapper_1.wrapResponse)(comments.map((comment) => ({
            commentId: comment.comment_id,
            commentorId: userId,
            commentBody: comment.comment_body,
            postId: postId,
            createdAt: (0, date_fns_1.formatDistanceToNow)(comment.created_at, { addSuffix: true }),
            username: comment.username,
            profilePicture: comment.image_url,
            totalReaction: comment.totalReaction,
            reactions: comment.reactions,
        })));
        res.status(200).json(responseObjs);
    }
    catch (error) {
        if (error instanceof yup.ValidationError) {
            return next(new errors_1.BodyValidationError(error.errors));
        }
        return next(new errors_1.LoggerApiError(error, 500));
    }
});
exports.RetriveCommentsController = RetriveCommentsController;
