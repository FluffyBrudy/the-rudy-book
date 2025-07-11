"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CRON = exports.NOTIFICATION = exports.REACTION = exports.COMMENT = exports.POST = exports.AUTH = exports.ROOT = void 0;
exports.ROOT = "/api";
var AUTH;
(function (AUTH) {
    AUTH["ROOT"] = "/auth";
    AUTH["REGISTER"] = "/register";
    AUTH["LOGIN"] = "/login";
    AUTH["REFRESH_TOKEN"] = "/refresh";
    AUTH["AUTHORIZE"] = "/authorize";
    AUTH["LOGOUT"] = "/logout";
})(AUTH || (exports.AUTH = AUTH = {}));
var POST;
(function (POST) {
    POST["ROOT"] = "/post";
    POST["CREATE"] = "/create";
    POST["FETCH"] = "/fetch";
    POST["SEARCH"] = "/search";
    POST["FETCH_BY_ID"] = "/fetch/:postId";
    POST["FETCH_USER_POST"] = "/fetch/user/:userId";
})(POST || (exports.POST = POST = {}));
var COMMENT;
(function (COMMENT) {
    COMMENT["ROOT"] = "/comment";
    COMMENT["REPLY_ROOT"] = "/reply";
    COMMENT["CREATE"] = "/create";
    COMMENT["FETCH"] = "/fetch";
    COMMENT["FETCH_COMMENT_BY_ID"] = "/fetch/:commentId";
    COMMENT["FETCH_REPLY_BY_ID"] = "/fetch/:commentReplyId";
})(COMMENT || (exports.COMMENT = COMMENT = {}));
var REACTION;
(function (REACTION) {
    REACTION["ROOT"] = "/reaction";
    REACTION["CREATE"] = "/create";
    REACTION["FETCH"] = "/fetch";
})(REACTION || (exports.REACTION = REACTION = {}));
var NOTIFICATION;
(function (NOTIFICATION) {
    NOTIFICATION["ROOT"] = "/notification";
    NOTIFICATION["FETCH"] = "/fetch";
    NOTIFICATION["DELETE"] = "/delete";
    NOTIFICATION["TOGGLE_READ"] = "/toggle-read";
})(NOTIFICATION || (exports.NOTIFICATION = NOTIFICATION = {}));
var CRON;
(function (CRON) {
    CRON["ROOT"] = "/cron";
})(CRON || (exports.CRON = CRON = {}));
