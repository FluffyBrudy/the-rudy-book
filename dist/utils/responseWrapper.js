"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapResponse = wrapResponse;
function wrapResponse(data = null, overrides = {}) {
    if (data === undefined) {
        return { success: false };
    }
    return Object.assign(Object.assign({ success: true }, overrides), { data: data });
}
