import React from 'react';
export declare const TIMELINE_TIME_INDICATOR_HEIGHT = 39;
export declare const TimelineTimePlaceholders: React.FC;
export declare const TimelineTimePadding: React.FC;
export declare const getNiceSecondInterval: (rawNthSecond: number) => number;
type TickInterval = {
    readonly interval: number;
    readonly unit: 'frames' | 'seconds';
};
export type TimelineTickScale = {
    readonly labelEverySeconds: number;
    readonly mediumTickEvery: TickInterval | null;
    readonly minorTickEvery: TickInterval | null;
};
export declare const getTimelineTickScale: ({ fps, frameInterval, rawSecondMarkerEveryNth, }: {
    readonly fps: number;
    readonly frameInterval: number;
    readonly rawSecondMarkerEveryNth: number;
}) => TimelineTickScale;
export declare const TimelineTimeIndicators: React.FC;
export {};
