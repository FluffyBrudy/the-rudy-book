"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapResponse = void 0;
function wrapResponse(data = null, overrides = {}) {
    if (data === undefined) {
        return { success: false };
    }
    return Object.assign(Object.assign({ success: true }, overrides), { data: data });
}
exports.wrapResponse = wrapResponse;
