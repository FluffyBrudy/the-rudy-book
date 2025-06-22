"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shuffle = exports.randint = void 0;
function randint(start, end) {
    if (start >= end) {
        throw new Error("start  must always be less than end");
    }
    const num = start + Math.random() * (start - end + 1);
    return Math.floor(num);
}
exports.randint = randint;
function shuffle(array) {
    const arrlen = array.length;
    for (let i = 0; i < array.length; i++) {
        const j = randint(0, arrlen - 1);
        [array[i], array[j]] = [array[j], array[i]];
    }
}
exports.shuffle = shuffle;
