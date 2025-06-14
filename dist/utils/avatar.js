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
exports.uploadDefaultProfileImage = void 0;
const imageUpload_1 = require("../service/imageUpload");
function generateGradient(name) {
    const hash = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const color1 = `hsl(${hash % 360}, 70%, 60%)`;
    const color2 = `hsl(${(hash + 60) % 360}, 70%, 60%)`;
    return [color1, color2];
}
function generateAvatarSVG(name, size = 64) {
    const initials = name ? name[0].toUpperCase() : "?";
    const [color1, color2] = generateGradient(name);
    return `
<svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="100%" stop-color="${color2}" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="50" fill="url(#grad-${name})" />
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle"
        font-size="40" fill="white" font-family="Arial, sans-serif">
    ${initials}
  </text>
</svg>
  `.trim();
}
function uploadDefaultProfileImage(name) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const svgString = generateAvatarSVG(name);
        const bufferData = Buffer.from(svgString);
        const uploadResponse = yield (0, imageUpload_1.uploadImageFromBuffer)(bufferData, name);
        return (_a = uploadResponse === null || uploadResponse === void 0 ? void 0 : uploadResponse.secure_url) !== null && _a !== void 0 ? _a : null;
    });
}
exports.uploadDefaultProfileImage = uploadDefaultProfileImage;
