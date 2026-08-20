"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTimelineVideoInfoWidths = void 0;
const get_timeline_media_visualization_layout_1 = require("./get-timeline-media-visualization-layout");
const getTimelineVideoInfoWidths = ({ visualizationWidth, naturalWidth, premountWidth, postmountWidth, }) => {
    return {
        mediaVisualizationWidth: (0, get_timeline_media_visualization_layout_1.getTimelineMediaVisualizationLayout)({
            visualizationWidth,
            premountWidth,
            postmountWidth,
        }).width,
        mediaNaturalWidth: (0, get_timeline_media_visualization_layout_1.getTimelineMediaVisualizationLayout)({
            visualizationWidth: naturalWidth,
            premountWidth,
            postmountWidth,
        }).width,
    };
};
exports.getTimelineVideoInfoWidths = getTimelineVideoInfoWidths;
