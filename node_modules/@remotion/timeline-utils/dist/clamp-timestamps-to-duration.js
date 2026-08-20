"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clampTimestampsToDuration = void 0;
const LAST_FRAME_EPSILON_IN_SECONDS = 1 / 1000000;
const clampTimestampsToDuration = ({ timestamps, durationInSeconds, }) => {
    if (durationInSeconds === null) {
        return [...timestamps];
    }
    const lastTimestamp = Math.max(0, durationInSeconds - LAST_FRAME_EPSILON_IN_SECONDS);
    return timestamps.map((timestamp) => Math.min(timestamp, lastTimestamp));
};
exports.clampTimestampsToDuration = clampTimestampsToDuration;
