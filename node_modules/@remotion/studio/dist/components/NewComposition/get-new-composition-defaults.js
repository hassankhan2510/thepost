"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewCompositionDefaults = void 0;
const defaultCompositionDimensions = {
    width: 1920,
    height: 1080,
    fps: 30,
    durationInFrames: 150,
};
const canvasCaptureFps = 60;
const getNewCompositionDefaults = (composition, canvasCaptureDurationInSeconds) => {
    if (canvasCaptureDurationInSeconds !== null) {
        return {
            ...defaultCompositionDimensions,
            fps: canvasCaptureFps,
            durationInFrames: Math.max(1, Math.ceil(canvasCaptureDurationInSeconds * canvasCaptureFps)),
        };
    }
    return composition !== null && composition !== void 0 ? composition : defaultCompositionDimensions;
};
exports.getNewCompositionDefaults = getNewCompositionDefaults;
