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
exports.CreateUserReactionController = void 0;
const yup = __importStar(require("yup"));
const validation_1 = require("../../constants/validation");
const dbClient_1 = require("../../database/dbClient");
const errors_1 = require("../../errors/errors");
const responseWrapper_1 = require("../../utils/responseWrapper");
const pg_1 = require("pg");
const dbCommonQuery_1 = require("../../lib/dbCommonQuery");
const notificationSender_1 = require("../../lib/notificationSender");
const UserReactionSchema = yup.object().shape({
    reactionOnId: yup.number().required("reaction target is required"),
    reactionOnType: yup
        .string()
        .required("reaction on type(Post, Comment, Reply) is required")
        .oneOf(Object.values(validation_1.EReactionOnTypes)),
    reactionType: yup
        .string()
        .required("reaction type is required")
        .oneOf(Object.values(validation_1.EReactionTypes)),
});
const CreateUserReactionController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = req.user;
    try {
        const { reactionOnId, reactionOnType, reactionType } = UserReactionSchema.validateSync(req.body);
        const [targetAuthor, image] = yield Promise.all([
            (0, dbCommonQuery_1.checkTargetExist)(reactionOnType, reactionOnId),
            dbClient_1.pigeonDb
                .selectFrom("Profile")
                .select("Profile.picture")
                .where("userId", "=", user.id)
                .executeTakeFirst(),
        ]);
        if (!targetAuthor)
            return next(new errors_1.ApiError(404, `${reactionOnType} doesnt exist`, true));
        const reaction = yield dbClient_1.mainDb
            .insertInto("reaction")
            .values({
            reaction_on_id: reactionOnId,
            reactor_id: user.id,
            reaction_on_type: reactionOnType,
            username: user.username,
            image_url: (_a = image === null || image === void 0 ? void 0 : image.picture) !== null && _a !== void 0 ? _a : "",
            reaction_type: reactionType,
        })
            .returningAll()
            .executeTakeFirst();
        if (!reaction)
            return next(new errors_1.ApiError(500, "reaction failed", true));
        const responseObj = (0, responseWrapper_1.wrapResponse)({
            profilePicture: reaction.image_url,
            reactionOnId: reaction.reaction_on_id,
            reactionOnType: reaction.reaction_on_type,
            reactionType: reaction.reaction_type,
            reactorTd: reaction.reactor_id,
            username: reaction.username,
        });
        res.status(201).json(responseObj);
        (0, notificationSender_1.sendNotification)(targetAuthor, `${user.username} reacted on your ${reactionOnType.toLocaleLowerCase()}`, reactionOnId, reactionOnType, req.headers.authorization)
            .then()
            .catch();
    }
    catch (error) {
        if (error instanceof yup.ValidationError) {
            return next(new errors_1.BodyValidationError(error.errors));
        }
        if (error instanceof pg_1.DatabaseError && error.code === "23503") {
            return next(new errors_1.ApiError(404, `target doesn't doesnt exist`));
        }
        if (error instanceof pg_1.DatabaseError && error.code === "23505") {
            const deleteResponse = yield dbClient_1.mainDb
                .deleteFrom("reaction")
                .where("reaction.reactor_id", "=", user.id)
                .where("reaction.reaction_on_id", "=", req.body["reactionOnId"])
                .executeTakeFirst();
            if (!deleteResponse) {
                return next(new errors_1.ApiError(500, "unable to remove reaction", true));
            }
            const response = (0, responseWrapper_1.wrapResponse)({
                undo: true,
                reactionOnId: req.body["reactionOnId"],
                reactorId: req.body["reactionId"],
            });
            res.status(200).json(response);
        }
        else {
            return next(new errors_1.LoggerApiError(error, 500));
        }
    }
});
exports.CreateUserReactionController = CreateUserReactionController;
