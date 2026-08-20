"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFramesToRender = void 0;
const getFramesToRender = (frameRange, everyNthFrame) => {
    if (everyNthFrame === 0) {
        throw new Error('everyNthFrame cannot be 0');
    }
    const ranges = Array.isArray(frameRange[0])
        ? frameRange
        : [frameRange];
    return ranges.flatMap((range) => new Array(range[1] - range[0] + 1)
        .fill(true)
        .map((_, index) => {
        return index + range[0];
    })
        .filter((frame) => {
        return (frame - range[0]) % everyNthFrame === 0;
    }));
};
exports.getFramesToRender = getFramesToRender;
