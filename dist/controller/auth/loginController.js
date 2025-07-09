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
exports.LoginController = void 0;
const yup = __importStar(require("yup"));
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = require("jsonwebtoken");
const validation_1 = require("../../constants/validation");
const errors_1 = require("../../errors/errors");
const dbClient_1 = require("../../database/dbClient");
const responseWrapper_1 = require("../../utils/responseWrapper");
const loginSchema = yup.object().shape({
    email: yup.string().required().email("use proper email format"),
    password: yup
        .string()
        .required()
        .trim()
        .min(validation_1.MIN_PASSWORD_LENGTH)
        .max(validation_1.MAX_PASSWORD_LENGTH)
        .matches(/[a-z]/, "must contain at least one lowercase letter")
        .matches(/[A-Z]/, "must contain at least one uppercase letter")
        .matches(/[0-9]/, "must contain at least one number")
        .matches(/^\S*$/, "password must not contain any space"),
});
const LoginController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = loginSchema.validateSync(req.body);
        const user = yield dbClient_1.pigeonDb
            .selectFrom("User")
            .innerJoin("Profile", "Profile.userId", "User.id")
            .select(["User.id", "User.password", "User.username", "Profile.picture"])
            .where("User.email", "=", email)
            .executeTakeFirst();
        if (!user)
            return next(new errors_1.ApiError(404, "user"));
        const comaprePassword = (0, bcryptjs_1.compareSync)(password, user.password);
        if (!comaprePassword)
            return next(new errors_1.ApiError(401, "invalid password", true));
        const accessToken = (0, jsonwebtoken_1.sign)({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "15m" });
        const refreshToken = (0, jsonwebtoken_1.sign)({ id: user.id, username: user.username }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            signed: true,
            sameSite: "none",
            partitioned: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/"
        });
        const responseObj = (0, responseWrapper_1.wrapResponse)({
            accessToken,
            userId: user.id,
            username: user.username,
            email: email,
            profilePicture: user.picture,
        });
        res.json(responseObj);
    }
    catch (error) {
        if (error instanceof yup.ValidationError) {
            return next(new errors_1.BodyValidationError(error.errors));
        }
        return next(new errors_1.LoggerApiError(error, 500));
    }
});
exports.LoginController = LoginController;
