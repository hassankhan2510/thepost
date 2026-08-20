import React from 'react';
import type { SelectedOutline } from './selected-outline-geometry';
import { type SelectedOutlineTarget } from './selected-outline-types';
export declare const SelectedOutlineCropControls: React.FC<{
    readonly outline: SelectedOutline;
    readonly onDraggingChange: (dragging: boolean) => void;
    readonly target: SelectedOutlineTarget | undefined;
}>;
