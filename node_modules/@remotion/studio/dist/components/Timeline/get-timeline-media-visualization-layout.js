"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimelineMediaVisualizationLayout = void 0;
const getTimelineMediaVisualizationLayout = ({ visualizationWidth, premountWidth, postmountWidth, }) => {
    return {
        marginLeft: premountWidth,
        width: Math.max(0, visualizationWidth - premountWidth - postmountWidth),
    };
};
exports.getTimelineMediaVisualizationLayout = getTimelineMediaVisualizationLayout;
