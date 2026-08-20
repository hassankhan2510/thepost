import { type FrameRange, type ResolvedFrameRange } from './frame-range';
export declare const getRealFrameRanges: (durationInFrames: number, frameRange: FrameRange | null) => ResolvedFrameRange[];
export declare const getRealFrameRange: (durationInFrames: number, frameRange: FrameRange | null) => [number, number];
