export type TimelineLoopDisplay = {
    durationInFrames: number;
    numberOfTimes: number;
    startOffset: number;
};
export declare const shouldTileLoopDisplay: (loopDisplay: TimelineLoopDisplay | undefined) => loopDisplay is TimelineLoopDisplay;
export type LoopDisplaySegment = {
    loopIndex: number;
    absoluteOffsetInFrames: number;
    loopOffsetInFrames: number;
    durationInFrames: number;
};
export declare const getLoopDisplaySegments: ({ displayDurationInFrames, displayOffsetInFrames, loopDurationInFrames, }: {
    readonly displayDurationInFrames: number;
    readonly displayOffsetInFrames: number;
    readonly loopDurationInFrames: number;
}) => LoopDisplaySegment[];
export declare const getLoopDisplayWidth: ({ visualizationWidth, loopDisplay, }: {
    visualizationWidth: number;
    loopDisplay: TimelineLoopDisplay | undefined;
}) => number;
