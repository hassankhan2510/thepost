import React from 'react';
import type { SequenceNodePathInfo } from '../../helpers/get-timeline-sequence-sort-key';
import type { getTimelineKeyframes } from './get-timeline-keyframes';
type TimelineExpandedKeyframeRowProps = {
    readonly height: number;
    readonly keyframes: ReturnType<typeof getTimelineKeyframes>;
    readonly canEditEasing: boolean;
    readonly nodePathInfo: SequenceNodePathInfo;
    readonly showSeparator: boolean;
};
export declare const TimelineExpandedKeyframeRow: React.NamedExoticComponent<TimelineExpandedKeyframeRowProps>;
export {};
