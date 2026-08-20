import React from 'react';
import type { SequenceNodePathInfo } from '../helpers/get-timeline-sequence-sort-key';
import type { SelectedOutline } from './selected-outline-geometry';
import type { SelectedOutlineLayoutTarget } from './selected-outline-types';
import type { TimelineSelection, TimelineSelectionInteraction } from './Timeline/TimelineSelection';
export declare const getSelectedOutlineUvHandleTimelineSelection: ({ effectIndex, fieldKey, nodePathInfo, }: {
    readonly effectIndex: number;
    readonly fieldKey: string;
    readonly nodePathInfo: SequenceNodePathInfo;
}) => TimelineSelection;
export declare const SelectedOutlineUvHandleConnectionLayer: React.FC<{
    readonly layoutTarget: SelectedOutlineLayoutTarget | undefined;
    readonly outline: SelectedOutline;
}>;
export declare const SelectedOutlineUvHandleCircleLayer: React.FC<{
    readonly layoutTarget: SelectedOutlineLayoutTarget | undefined;
    readonly onDraggingChange: (dragging: boolean) => void;
    readonly onSelect: (item: TimelineSelection, interaction?: TimelineSelectionInteraction) => void;
    readonly outline: SelectedOutline;
}>;
