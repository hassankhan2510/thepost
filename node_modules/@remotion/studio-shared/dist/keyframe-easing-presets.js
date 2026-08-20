"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KEYFRAME_EASING_PRESETS = exports.getOutKeyframeEasing = exports.getPolyKeyframeEasing = exports.getBackKeyframeEasing = exports.CUBIC_KEYFRAME_EASING = exports.QUAD_KEYFRAME_EASING = exports.EASE_KEYFRAME_EASING = exports.HOLD_KEYFRAME_EASING = exports.LINEAR_KEYFRAME_EASING = void 0;
exports.LINEAR_KEYFRAME_EASING = { type: 'linear' };
exports.HOLD_KEYFRAME_EASING = { type: 'step1' };
exports.EASE_KEYFRAME_EASING = {
    type: 'bezier',
    x1: 0.42,
    y1: 0,
    x2: 1,
    y2: 1,
};
exports.QUAD_KEYFRAME_EASING = {
    type: 'bezier',
    x1: 1 / 3,
    y1: 0,
    x2: 2 / 3,
    y2: 1 / 3,
};
exports.CUBIC_KEYFRAME_EASING = {
    type: 'bezier',
    x1: 1 / 3,
    y1: 0,
    x2: 2 / 3,
    y2: 0,
};
const getBackKeyframeEasing = (s = 1.70158) => ({
    type: 'bezier',
    x1: 1 / 3,
    y1: 0,
    x2: 2 / 3,
    y2: -s / 3,
});
exports.getBackKeyframeEasing = getBackKeyframeEasing;
const getPolyKeyframeEasing = (n) => {
    if (n === 1) {
        return exports.LINEAR_KEYFRAME_EASING;
    }
    if (n === 2) {
        return exports.QUAD_KEYFRAME_EASING;
    }
    if (n === 3) {
        return exports.CUBIC_KEYFRAME_EASING;
    }
    return null;
};
exports.getPolyKeyframeEasing = getPolyKeyframeEasing;
const getOutKeyframeEasing = (easing) => {
    if (easing.type === 'linear') {
        return exports.LINEAR_KEYFRAME_EASING;
    }
    if (easing.type !== 'bezier') {
        return null;
    }
    return {
        type: 'bezier',
        x1: 1 - easing.x2,
        y1: 1 - easing.y2,
        x2: 1 - easing.x1,
        y2: 1 - easing.y1,
    };
};
exports.getOutKeyframeEasing = getOutKeyframeEasing;
exports.KEYFRAME_EASING_PRESETS = [
    {
        id: 'ease-in',
        label: 'Ease in',
        easing: { type: 'bezier', x1: 0.42, y1: 0, x2: 1, y2: 1 },
    },
    {
        id: 'ease-out',
        label: 'Ease out',
        easing: { type: 'bezier', x1: 0, y1: 0, x2: 0.58, y2: 1 },
    },
    {
        id: 'ease-in-out',
        label: 'Ease in-out',
        easing: { type: 'bezier', x1: 0.42, y1: 0, x2: 0.58, y2: 1 },
    },
    {
        id: 'hold',
        label: 'Hold',
        easing: exports.HOLD_KEYFRAME_EASING,
    },
    {
        id: 'tail-spring',
        label: 'Tail spring',
        easing: {
            type: 'spring',
            allowTail: true,
            damping: 200,
            durationRestThreshold: 0.02,
            mass: 1,
            overshootClamping: false,
            stiffness: 100,
        },
    },
    {
        id: 'spring',
        label: 'Spring',
        easing: {
            type: 'spring',
            allowTail: true,
            damping: 10,
            durationRestThreshold: 0.02,
            mass: 1,
            overshootClamping: false,
            stiffness: 100,
        },
    },
    {
        id: 'bouncy-spring',
        label: 'Bouncy spring',
        easing: {
            type: 'spring',
            allowTail: true,
            damping: 5,
            durationRestThreshold: 0.02,
            mass: 1,
            overshootClamping: false,
            stiffness: 120,
        },
    },
];
