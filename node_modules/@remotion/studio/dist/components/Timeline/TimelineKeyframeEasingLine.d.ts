import React from 'react';
import type { SequenceNodePathInfo } from '../../helpers/get-timeline-sequence-sort-key';
export declare const getTimelineKeyframeEasingLineStyle: (selected: boolean) => React.CSSProperties;
export declare const TimelineKeyframeEasingLineVisual: React.NamedExoticComponent<{
    readonly selected: boolean;
}>;
type TimelineKeyframeEasingLineProps = {
    readonly fromFrame: number;
    readonly toFrame: number;
    readonly rowHeight: number;
    readonly nodePathInfo: SequenceNodePathInfo;
    readonly segmentIndex: number;
};
export declare const TimelineKeyframeEasingLine: React.NamedExoticComponent<TimelineKeyframeEasingLineProps>;
export {};
