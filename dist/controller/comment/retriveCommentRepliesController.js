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
exports.RetriveCommentRepliesController = void 0;
const yup = __importStar(require("yup"));
const dbClient_1 = require("../../database/dbClient");
const errors_1 = require("../../errors/errors");
const dbQueryFraments_1 = require("../../lib/dbQueryFraments");
const responseWrapper_1 = require("../../utils/responseWrapper");
const date_fns_1 = require("date-fns");
const ReplyRetriveSchema = yup.object().shape({
    parentCommentId: yup.number().required("comment id is required"),
});
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
