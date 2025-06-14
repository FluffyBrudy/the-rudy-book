"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAuth = void 0;
const passport_1 = __importDefault(require("passport"));
const errors_1 = require("../errors/errors");
const verifyAuth = () => {
    const handler = (req, res, next) => {
        return passport_1.default.authenticate("jwt", { session: false }, (err, user, info) => {
            if (err)
                return next(err);
            if (!user) {
                return next(new errors_1.ApiError(401, (info === null || info === void 0 ? void 0 : info.message) || "user", !!(info === null || info === void 0 ? void 0 : info.message)));
            }
            req.user = user;
            next();
        })(req, res, next);
    };
    return handler;
};
exports.verifyAuth = verifyAuth;
