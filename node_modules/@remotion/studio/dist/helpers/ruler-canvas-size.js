"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRulerCanvasSize = exports.applyRulerInsetsToCanvasSize = void 0;
const editor_rulers_1 = require("../state/editor-rulers");
const applyRulerInsetsToCanvasSize = ({ rulersAreVisible, size, }) => {
    if (!rulersAreVisible) {
        return size;
    }
    return {
        ...size,
        left: size.left + editor_rulers_1.RULER_WIDTH,
        top: size.top + editor_rulers_1.RULER_WIDTH,
        width: size.width - editor_rulers_1.RULER_WIDTH,
        height: size.height - editor_rulers_1.RULER_WIDTH,
    };
};
exports.applyRulerInsetsToCanvasSize = applyRulerInsetsToCanvasSize;
const getRulerCanvasSize = ({ orientation, size, }) => {
    if (orientation === 'vertical') {
        return {
            height: size.height,
            width: editor_rulers_1.RULER_WIDTH,
        };
    }
    return {
        height: editor_rulers_1.RULER_WIDTH,
        width: size.width,
    };
};
exports.getRulerCanvasSize = getRulerCanvasSize;
