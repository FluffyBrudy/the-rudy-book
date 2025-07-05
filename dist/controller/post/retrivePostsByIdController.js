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
exports.RetrivePostsByIdController = void 0;
const yup = __importStar(require("yup"));
const dbCommonQuery_1 = require("../../lib/dbCommonQuery");
const errors_1 = require("../../errors/errors");
const responseWrapper_1 = require("../../utils/responseWrapper");
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
