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
exports.TokenAuthorizationController = void 0;
const dbClient_1 = require("../../database/dbClient");
const responseWrapper_1 = require("../../utils/responseWrapper");
const errors_1 = require("../../errors/errors");
const TokenAuthorizationController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    try {
        const userData = yield dbClient_1.pigeonDb
            .selectFrom("User")
            .select(["User.id", "User.username", "User.email"])
            .innerJoin("Profile", "Profile.userId", "User.id")
            .where("userId", "=", user.id)
            .select("Profile.picture")
            .executeTakeFirstOrThrow();
        const responseObj = (0, responseWrapper_1.wrapResponse)({
            userId: userData.id,
            username: userData.username,
            email: userData.email,
            profilePicture: userData.picture,
        });
        res.json(responseObj);
    }
    catch (error) {
        return next(new errors_1.LoggerApiError(error, 500));
    }
});
exports.TokenAuthorizationController = TokenAuthorizationController;
