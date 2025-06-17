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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateImageURLS = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../logger/logger");
function validateImageURL(imageUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const response = yield axios_1.default.head(imageUrl, {
                timeout: 5000,
                maxContentLength: 1024 * 1024 * 5,
            });
            if (response.status !== 200)
                return false;
            /*
                 http1.0 spec says case insensative but autocompletion give Capitaalized, so  workaround
             */
            const contentType = (_a = response.headers["Content-Type"]) !== null && _a !== void 0 ? _a : response.headers["content-type"];
            const isContentImage = contentType &&
                typeof contentType === "string" &&
                contentType.startsWith("image/");
            return isContentImage;
        }
        catch (error) {
            logger_1.logger.error({ ImageValidation: error });
            return false;
        }
    });
}
function validateImageURLS(imageUrls) {
    return __awaiter(this, void 0, void 0, function* () {
        const requestPromises = imageUrls.map((imageUrl) => validateImageURL(imageUrl));
        const res = yield Promise.all(requestPromises);
        return res.every(Boolean);
    });
}
exports.validateImageURLS = validateImageURLS;
