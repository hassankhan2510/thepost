import type { Caption } from './caption';
export type EnsureMaxCharactersPerLineInput = {
    captions: Caption[];
    maxCharsPerLine: number;
};
export type EnsureMaxCharactersPerLineOutput = {
    segments: Caption[][];
};
export declare const ensureMaxCharactersPerLine: ({ captions, maxCharsPerLine, }: EnsureMaxCharactersPerLineInput) => EnsureMaxCharactersPerLineOutput;
