import React from 'react';
import type { SelectedOutline } from './selected-outline-geometry';
import { type SelectedOutlineRotationCorner } from './selected-outline-measurement';
import { type SelectedOutlineContextMenuOpenHandler, type SelectedOutlineRotationDragTarget, type SelectedOutlineTarget } from './selected-outline-types';
import type { TimelineSelection, TimelineSelectionInteraction } from './Timeline/TimelineSelection';
export declare const SelectedOutlineRotationCornerHandle: React.FC<{
    readonly getAllRotationDragTargets: () => readonly SelectedOutlineRotationDragTarget[];
    readonly corner: SelectedOutlineRotationCorner;
    readonly dragging: boolean;
    readonly handlePoint: {
        readonly x: number;
        readonly y: number;
    };
    readonly outline: SelectedOutline;
    readonly onDraggingChange: (dragging: boolean) => void;
    readonly onContextMenuOpen: SelectedOutlineContextMenuOpenHandler;
    readonly onContextMenuOpenChange: (open: boolean) => void;
    readonly onHoverChange: (key: string | null) => void;
    readonly onSelect: (item: TimelineSelection, interaction: TimelineSelectionInteraction) => void;
    readonly radius: number;
    readonly target: SelectedOutlineTarget | undefined;
}>;
