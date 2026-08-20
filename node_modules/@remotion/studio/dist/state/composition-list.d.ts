import React from 'react';
type CompositionListState = 'loading' | 'ready';
export declare const compositionListRenderedRef: {
    current: boolean;
};
export declare const CompositionListContext: React.Context<{
    compositionListState: CompositionListState;
    setCompositionListState: React.Dispatch<React.SetStateAction<CompositionListState>>;
}>;
export declare const CompositionListProvider: React.FC<{
    readonly children: React.ReactNode;
}>;
export {};
