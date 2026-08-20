export type NestedTimelineTrack<T> = {
    readonly track: T;
    readonly siblingIndex: number;
    readonly children: NestedTimelineTrack<T>[];
};
export declare const nestTimelineTracks: <T extends {
    readonly depth: number;
}>(timeline: readonly T[]) => NestedTimelineTrack<T>[];
