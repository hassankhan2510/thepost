"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isVideoWithLastFrameHold = void 0;
const isVideoWithLastFrameHold = (sequence) => {
    var _a;
    return (sequence.type === 'video' &&
        ((_a = sequence.controls) === null || _a === void 0 ? void 0 : _a.componentIdentity) === 'dev.remotion.media.Video');
};
exports.isVideoWithLastFrameHold = isVideoWithLastFrameHold;
