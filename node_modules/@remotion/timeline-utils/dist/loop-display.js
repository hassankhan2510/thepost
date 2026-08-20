"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLoopDisplayWidth = exports.getLoopDisplaySegments = exports.shouldTileLoopDisplay = void 0;
const shouldTileLoopDisplay = (loopDisplay) => {
    return loopDisplay !== undefined && loopDisplay.numberOfTimes > 1;
};
exports.shouldTileLoopDisplay = shouldTileLoopDisplay;
// Computes the visible loop segments by loop index instead of accumulating
// floating-point segment durations. With fractional display offsets (e.g. from
// horizontal timeline virtualization), an accumulating `processed += segment`
// loop can stall once the residue is smaller than the ULP of `processed`,
// growing arrays unboundedly until the tab runs out of memory.
const getLoopDisplaySegments = ({ displayDurationInFrames, displayOffsetInFrames, loopDurationInFrames, }) => {
    if (!Number.isFinite(displayDurationInFrames) ||
        displayDurationInFrames <= 0 ||
        !Number.isFinite(displayOffsetInFrames) ||
        !Number.isFinite(loopDurationInFrames) ||
        loopDurationInFrames <= 0) {
        return [];
    }
    const displayEndInFrames = displayOffsetInFrames + displayDurationInFrames;
    const firstLoopIndex = Math.floor(displayOffsetInFrames / loopDurationInFrames);
    const lastLoopIndex = Math.floor(displayEndInFrames / loopDurationInFrames);
    const segments = [];
    for (let loopIndex = firstLoopIndex; loopIndex <= lastLoopIndex; loopIndex++) {
        const loopStartInFrames = loopIndex * loopDurationInFrames;
        const segmentStart = Math.max(displayOffsetInFrames, loopStartInFrames);
        const segmentEnd = Math.min(displayEndInFrames, loopStartInFrames + loopDurationInFrames);
        const durationInFrames = segmentEnd - segmentStart;
        if (durationInFrames <= 0) {
            continue;
        }
        segments.push({
            loopIndex,
            absoluteOffsetInFrames: segmentStart,
            loopOffsetInFrames: segmentStart - loopStartInFrames,
            durationInFrames,
        });
    }
    return segments;
};
exports.getLoopDisplaySegments = getLoopDisplaySegments;
const getLoopDisplayWidth = ({ visualizationWidth, loopDisplay, }) => {
    if (!(0, exports.shouldTileLoopDisplay)(loopDisplay)) {
        return visualizationWidth;
    }
    return visualizationWidth / loopDisplay.numberOfTimes;
};
exports.getLoopDisplayWidth = getLoopDisplayWidth;
