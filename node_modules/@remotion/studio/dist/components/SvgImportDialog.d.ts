import React from 'react';
import type { SvgImportDialogState } from '../state/modals';
export type SvgImportMode = 'image' | 'inline';
export declare const useSvgImportDialog: () => () => Promise<SvgImportMode | null>;
export declare const SvgImportDialog: React.FC<{
    readonly state: SvgImportDialogState;
}>;
