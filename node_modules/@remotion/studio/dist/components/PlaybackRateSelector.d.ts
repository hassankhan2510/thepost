import React from 'react';
import type { ComboboxValue } from './NewComposition/ComboBox';
type PlaybackRateMenuItemsProps = {
    readonly playbackRate: number;
    readonly setPlaybackRate: React.Dispatch<React.SetStateAction<number>>;
};
export declare const usePlaybackRateMenuItems: ({ playbackRate, setPlaybackRate, }: PlaybackRateMenuItemsProps) => {
    items: ComboboxValue[];
    selectedId: string;
};
export declare const PlaybackRateSelector: React.FC<PlaybackRateMenuItemsProps>;
export {};
