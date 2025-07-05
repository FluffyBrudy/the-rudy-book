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
exports.RegisterController = void 0;
const yup = __importStar(require("yup"));
const bcryptjs_1 = require("bcryptjs");
const validation_1 = require("../../constants/validation");
const errors_1 = require("../../errors/errors");
const dbClient_1 = require("../../database/dbClient");
const avatar_1 = require("../../utils/avatar");
const responseWrapper_1 = require("../../utils/responseWrapper");
const pg_1 = require("pg");
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
const registerSchema = loginSchema.concat(yup.object().shape({
    username: yup
        .string()
        .required()
        .min(validation_1.MIN_USERNAME_LENGTH)
        .max(validation_1.MAX_USERNAME_LENGTH),
}));
const RegisterController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = registerSchema.validateSync(req.body, { abortEarly: false });
        let responseObjData;
        yield dbClient_1.pigeonDb.transaction().execute((trx) => __awaiter(void 0, void 0, void 0, function* () {
            const imageUploadPromise = (0, avatar_1.uploadDefaultProfileImage)(username);
            const user = yield trx
                .insertInto("User")
                .values({
                username,
                email,
                password: (0, bcryptjs_1.hashSync)(password, (0, bcryptjs_1.genSaltSync)(10)),
            })
                .returning("User.id")
                .executeTakeFirstOrThrow();
            const imageUploadResponse = yield imageUploadPromise;
            if (imageUploadResponse) {
                const profile = yield trx
                    .insertInto("Profile")
                    .values({
                    userId: user.id,
                    picture: imageUploadResponse,
                })
                    .execute();
            }
            responseObjData = (0, responseWrapper_1.wrapResponse)(null);
        }));
        res.json(responseObjData);
    }
    catch (error) {
        if (error instanceof yup.ValidationError)
            return next(new errors_1.BodyValidationError(error.errors));
        if (error instanceof pg_1.DatabaseError && error.code === "23505") {
            return next(new errors_1.ApiError(409, "User with this email already exists", true));
        }
        return next(new errors_1.LoggerApiError(error, 500));
    }
});
exports.RegisterController = RegisterController;
