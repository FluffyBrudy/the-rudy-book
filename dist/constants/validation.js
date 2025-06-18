"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EReactionOnTypes = exports.EReactionTypes = exports.MAX_COMMENT_ROWS_FETCH_LIMIT = exports.MAX_COMMENT_LENGTH = exports.MAX_POST_MEDIA_CONTENT_LENGTH = exports.MAX_POST_TEXT_LENGTH = exports.MAX_PASSWORD_LENGTH = exports.MIN_PASSWORD_LENGTH = exports.MAX_USERNAME_LENGTH = exports.MIN_USERNAME_LENGTH = void 0;
exports.MIN_USERNAME_LENGTH = 3;
exports.MAX_USERNAME_LENGTH = 50;
exports.MIN_PASSWORD_LENGTH = 8;
exports.MAX_PASSWORD_LENGTH = 16;
exports.MAX_POST_TEXT_LENGTH = 1500;
exports.MAX_POST_MEDIA_CONTENT_LENGTH = 5;
exports.MAX_COMMENT_LENGTH = 500;
exports.MAX_COMMENT_ROWS_FETCH_LIMIT = 50;
var EReactionTypes;
(function (EReactionTypes) {
    EReactionTypes["THUMBUP"] = "thumbup";
    EReactionTypes["SAD"] = "sad";
    EReactionTypes["ANGRY"] = "angry";
    EReactionTypes["CARE"] = "care";
    EReactionTypes["HEART"] = "heart";
    EReactionTypes["FUNNY"] = "funny";
})(EReactionTypes || (exports.EReactionTypes = EReactionTypes = {}));
var EReactionOnTypes;
(function (EReactionOnTypes) {
    EReactionOnTypes["COMMENT"] = "comment";
    EReactionOnTypes["POST"] = "post";
    EReactionOnTypes["REPLY"] = "reply";
})(EReactionOnTypes || (exports.EReactionOnTypes = EReactionOnTypes = {}));
