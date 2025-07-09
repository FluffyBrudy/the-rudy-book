"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutController = void 0;
const errors_1 = require("../../errors/errors");
const LogoutController = (req, res, next) => {
    try {
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
            signed: true,
            sameSite: "none",
            path: "/",
        });
        res.status(200).json({ message: "Successfully logged out." });
    }
    catch (error) {
        return next(new errors_1.LoggerApiError(error, 500));
    }
};
exports.LogoutController = LogoutController;
