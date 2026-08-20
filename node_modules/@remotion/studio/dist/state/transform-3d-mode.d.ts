import React from 'react';
type Transform3DModeState = {
    readonly manuallyEnabledSequenceKeys: ReadonlySet<string>;
    readonly setManuallyEnabled: (sequenceKey: string, enabled: boolean) => void;
};
export declare const Transform3DModeStateContext: React.Context<Transform3DModeState>;
export declare const Transform3DModeStateProvider: React.FC<{
    readonly children: React.ReactNode;
}>;
export {};
