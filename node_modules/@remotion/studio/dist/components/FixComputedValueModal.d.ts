import React from 'react';
import type { ModalState } from '../state/modals';
type FixComputedValueModalState = Extract<ModalState, {
    type: 'fix-computed-value';
}>;
export declare const FixComputedValueModal: React.FC<{
    readonly state: FixComputedValueModalState;
}>;
export {};
