"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = () => {
    const middleware = (error, req, res, next) => {
        res.status(error.status).json({ error: error.message, success: false });
    };
    return middleware;
};
exports.errorHandler = errorHandler;
