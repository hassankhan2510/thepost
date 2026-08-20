export type ResolvedFrameRange = [number, number];
export type OpenEndedFrameRange = [number, null];
export type FrameRangeTuple = ResolvedFrameRange | OpenEndedFrameRange;
export type SingleFrameRange = number | FrameRangeTuple;
export type FrameRange = SingleFrameRange | FrameRangeTuple[];
export type FrameSelection = FrameRange | {
    type: 'frames';
    frames: number[];
} | null;
export declare const isMultipleFrameRanges: (frameRange: FrameRange) => frameRange is FrameRangeTuple[];
export declare const validateFrameRange: (frameRange: FrameRange | null) => void;
