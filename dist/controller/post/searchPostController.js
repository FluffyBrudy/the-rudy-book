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
exports.SearchPostController = void 0;
const errors_1 = require("../../errors/errors");
const dbClient_1 = require("../../database/dbClient");
const kysely_1 = require("kysely");
const responseWrapper_1 = require("../../utils/responseWrapper");
const SearchPostController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const query = ((_a = req.query) !== null && _a !== void 0 ? _a : "");
    if (!query)
        return next(new errors_1.ApiError(400, "empty query"));
    if (query.length < 3)
        return next(new errors_1.ApiError(400, "insufficient search term"));
    try {
        const lexemeRegex = /\||&|!|\*|:/;
        const hasLexeme = query.match(lexemeRegex);
        if (!hasLexeme) {
            const posts = yield (0, kysely_1.sql) `
            SELECT content_tsv, post_id from post
            WHERE content_tsv @@ plainto_tsquery('english', ${query})
            `.execute(dbClient_1.mainDb);
            const response = (0, responseWrapper_1.wrapResponse)(posts);
            res.json(response);
        }
        else {
            const tokenizedQuery = query.split(lexemeRegex).join('|');
            const posts = yield (0, kysely_1.sql) `
            SELECT content_tsv, post_id from post
            WHERE content_tsv @@ plainto_tsquery('english', ${tokenizedQuery})
            `.execute(dbClient_1.mainDb);
            const response = (0, responseWrapper_1.wrapResponse)(posts);
            res.json(response);
        }
    }
    catch (error) {
        return next(new errors_1.LoggerApiError(error, 500));
    }
});
exports.SearchPostController = SearchPostController;
