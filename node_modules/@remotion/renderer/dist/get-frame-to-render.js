"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRealFrameRange = exports.getRealFrameRanges = void 0;
const frame_range_1 = require("./frame-range");
const resolveFrameRange = (durationInFrames, frameRange) => {
    if (typeof frameRange === 'number') {
        if (frameRange < 0 || frameRange >= durationInFrames) {
            throw new Error(`Frame number is out of range, must be between 0 and ${durationInFrames - 1} but got ${frameRange}`);
        }
        return [frameRange, frameRange];
    }
    const resolved = [
        frameRange[0],
        frameRange[1] === null ? durationInFrames - 1 : frameRange[1],
    ];
    if (resolved[0] < 0 ||
        resolved[1] >= durationInFrames ||
        resolved[0] > resolved[1]) {
        throw new Error(`The "durationInFrames" of the <Composition /> was evaluated to be ${durationInFrames}, but frame range ${resolved.join('-')} is not inbetween 0-${durationInFrames - 1}`);
    }
    return resolved;
};
const getRealFrameRanges = (durationInFrames, frameRange) => {
    if (frameRange === null) {
        return [[0, durationInFrames - 1]];
    }
    (0, frame_range_1.validateFrameRange)(frameRange);
    if ((0, frame_range_1.isMultipleFrameRanges)(frameRange)) {
        return frameRange.map((range) => resolveFrameRange(durationInFrames, range));
    }
    return [resolveFrameRange(durationInFrames, frameRange)];
};
exports.getRealFrameRanges = getRealFrameRanges;
const getRealFrameRange = (durationInFrames, frameRange) => {
    const ranges = (0, exports.getRealFrameRanges)(durationInFrames, frameRange);
    if (ranges.length !== 1) {
        throw new Error('Expected a single frame range, but received multiple frame ranges.');
    }
    return ranges[0];
};
exports.getRealFrameRange = getRealFrameRange;
