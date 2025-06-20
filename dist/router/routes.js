"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRON = exports.REACTION = exports.COMMENT = exports.POST = exports.AUTH = exports.ROOT = void 0;
exports.ROOT = "/api";
var AUTH;
(function (AUTH) {
    AUTH["ROOT"] = "/auth";
    AUTH["REGISTER"] = "/register";
    AUTH["LOGIN"] = "/login";
    AUTH["REFRESH_TOKEN"] = "/refresh-token";
    AUTH["AUTHORIZE"] = "/authorize";
})(AUTH || (exports.AUTH = AUTH = {}));
var POST;
(function (POST) {
    POST["ROOT"] = "/post";
    POST["CREATE"] = "/create";
    POST["FETCH"] = "/fetch";
})(POST || (exports.POST = POST = {}));
var COMMENT;
(function (COMMENT) {
    COMMENT["ROOT"] = "/comment";
    COMMENT["REPLY_ROOT"] = "/reply";
    COMMENT["CREATE"] = "/create";
    COMMENT["FETCH"] = "/fetch";
})(COMMENT || (exports.COMMENT = COMMENT = {}));
var REACTION;
(function (REACTION) {
    REACTION["ROOT"] = "/reaction";
    REACTION["CREATE"] = "/create";
    REACTION["FETCH"] = "/fetch";
})(REACTION || (exports.REACTION = REACTION = {}));
var CRON;
(function (CRON) {
    CRON["ROOT"] = "/cron";
})(CRON || (exports.CRON = CRON = {}));
