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
exports.TokenRefreshController = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const dbClient_1 = require("../../database/dbClient");
const responseWrapper_1 = require("../../utils/responseWrapper");
const errors_1 = require("../../errors/errors");
const TokenRefreshController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies["refreshToken"];
        if (!token)
            return next(new errors_1.ApiError(400));
        const { id } = (0, jsonwebtoken_1.verify)(token, process.env.JWT_REFRESH_SECRET);
        const user = yield dbClient_1.pigeonDb
            .selectFrom("User")
            .innerJoin("Profile", "Profile.userId", "User.id")
            .select(["User.id", "User.username", "User.email", "Profile.picture"])
            .where("User.id", "=", id)
            .executeTakeFirst();
        if (!user)
            return next(new errors_1.ApiError(404, "user"));
        const accessToken = (0, jsonwebtoken_1.sign)({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = (0, jsonwebtoken_1.sign)({ id: user.id, username: user.username }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            signed: true,
            sameSite: "none",
            partitioned: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        const responseObj = (0, responseWrapper_1.wrapResponse)({
            accessToken,
            userId: user.id,
            username: user.username,
            email: user.email,
            profilePicture: user.picture,
        });
        res.json(responseObj);
    }
    catch (error) {
        new errors_1.LoggerApiError(error, 500);
    }
});
exports.TokenRefreshController = TokenRefreshController;
