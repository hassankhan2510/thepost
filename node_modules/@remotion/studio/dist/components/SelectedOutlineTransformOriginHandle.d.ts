import React from 'react';
import type { SelectedOutline } from './selected-outline-geometry';
import { type SelectedOutlineLayoutTarget, type SelectedOutlineTarget } from './selected-outline-types';
export declare const SelectedOutlineTransformOriginHandle: React.FC<{
    readonly getLatestTargetByKey: (key: string) => SelectedOutlineTarget | undefined;
    readonly layoutTarget: SelectedOutlineLayoutTarget | undefined;
    readonly outline: SelectedOutline;
    readonly onDraggingChange: (dragging: boolean) => void;
}>;
