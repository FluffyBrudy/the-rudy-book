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
exports.convertSVGToBuffer = exports.uploadImageFromBuffer = void 0;
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
const logger_1 = require("../logger/logger");
require("dotenv").config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
});
function makeUploadStream(buffer, public_id) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const stream = new stream_1.Readable();
            stream.push(buffer);
            stream.push(null);
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                resource_type: "image",
                public_id: public_id,
                overwrite: false,
                folder: "pigeon-messanger",
            }, (err, res) => {
                if (err)
                    reject(err);
                else
                    resolve(res);
            });
            stream.pipe(uploadStream);
        });
    });
}
function uploadImageFromBuffer(imageBuffer, name) {
    return __awaiter(this, void 0, void 0, function* () {
        const publicId = name;
        try {
            const response = yield makeUploadStream(imageBuffer, publicId);
            const { secure_url } = response;
            return { secure_url };
        }
        catch (err) {
            logger_1.logger.error(err);
            const error = err;
            if ((error === null || error === void 0 ? void 0 : error.http_code) === 409) {
                return {
                    secure_url: cloudinary_1.v2.url(publicId, { secure: true, format: "svg" }),
                };
            }
            return null;
        }
    });
}
exports.uploadImageFromBuffer = uploadImageFromBuffer;
function convertSVGToBuffer(svgString) {
    const bufferData = Buffer.from(svgString, "utf-8");
    return bufferData;
}
exports.convertSVGToBuffer = convertSVGToBuffer;
