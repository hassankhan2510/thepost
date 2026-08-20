export declare const TIMELINE_ROW_BASE_PADDING = 10;
export declare const INSPECTOR_ROW_BASE_PADDING = 5;
export declare const TIMELINE_EYE_COLUMN_WIDTH = 22;
export declare const TIMELINE_ARROW_COLUMN_WIDTH = 16;
export declare const TIMELINE_KEYFRAME_CONTROLS_WIDTH = 38;
export declare const TIMELINE_FIELD_LABEL_EXTRA_WIDTH = 15;
export declare const getTimelineRowIndentWidth: (depth: number) => number;
export declare const getTimelineRowLeftChromeWidth: (depth: number, basePadding?: number) => number;
export declare const getTimelineFieldLabelFlexBasis: (depth: number, basePadding?: number) => string;
export declare const getExpandedRowDepth: ({ nestedDepth, treeDepth, }: {
    nestedDepth: number;
    treeDepth: number;
}) => number;
