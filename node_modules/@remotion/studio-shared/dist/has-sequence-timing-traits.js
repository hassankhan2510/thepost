"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasSequenceTimingTraits = void 0;
const sequenceTimingTraits = ['from', 'durationInFrames', 'trimBefore'];
const hasSequenceTimingTraits = (sequenceKeys) => {
    return sequenceTimingTraits.every((trait) => sequenceKeys.includes(trait));
};
exports.hasSequenceTimingTraits = hasSequenceTimingTraits;
