"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.svgPointToClientPoint = void 0;
const svgPointToClientPoint = (point, rect) => {
    return {
        x: point.x + rect.left,
        y: point.y + rect.top,
    };
};
exports.svgPointToClientPoint = svgPointToClientPoint;
