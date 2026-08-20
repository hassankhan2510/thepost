import React from 'react';
import { type SelectedOutlineScaleEdge } from './selected-outline-drag';
import type { SelectedOutline } from './selected-outline-geometry';
import { type SelectedOutlineContextMenuOpenHandler, type SelectedOutlineScaleDragTarget, type SelectedOutlineTarget } from './selected-outline-types';
import type { TimelineSelection, TimelineSelectionInteraction } from './Timeline/TimelineSelection';
export declare const SelectedOutlineScaleEdgeLine: React.FC<{
    readonly getAllScaleDragTargets: () => readonly SelectedOutlineScaleDragTarget[];
    readonly dragging: boolean;
    readonly edge: SelectedOutlineScaleEdge;
    readonly hitWidth: number;
    readonly outline: SelectedOutline;
    readonly onDraggingChange: (dragging: boolean) => void;
    readonly onContextMenuOpen: SelectedOutlineContextMenuOpenHandler;
    readonly onContextMenuOpenChange: (open: boolean) => void;
    readonly onHoverChange: (key: string | null) => void;
    readonly onSelect: (item: TimelineSelection, interaction: TimelineSelectionInteraction) => void;
    readonly target: SelectedOutlineTarget | undefined;
}>;
