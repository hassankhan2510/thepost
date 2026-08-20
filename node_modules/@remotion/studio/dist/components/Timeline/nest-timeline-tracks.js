"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nestTimelineTracks = void 0;
const nestTimelineTracks = (timeline) => {
    const roots = [];
    const stack = [];
    for (let trackIndex = 0; trackIndex < timeline.length; trackIndex++) {
        const track = timeline[trackIndex];
        while (stack.length > 0 &&
            stack[stack.length - 1].track.depth >= track.depth) {
            stack.pop();
        }
        const parent = stack[stack.length - 1];
        const siblings = parent ? parent.children : roots;
        const nestedTrack = {
            track,
            siblingIndex: siblings.length,
            children: [],
        };
        siblings.push(nestedTrack);
        stack.push(nestedTrack);
    }
    return roots;
};
exports.nestTimelineTracks = nestTimelineTracks;
