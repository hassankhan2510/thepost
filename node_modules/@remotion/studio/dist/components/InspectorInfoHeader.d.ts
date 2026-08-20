import React from 'react';
export declare const INSPECTOR_INFO_HEADER_MIN_HEIGHT = 84;
export declare const InspectorInfoHeader: React.FC<{
    readonly children?: React.ReactNode;
    readonly contentSized?: boolean;
    readonly minHeight?: number;
    readonly padding?: React.CSSProperties['padding'];
}>;
export declare const InspectorInfoTitle: React.FC<{
    readonly children: React.ReactNode;
}>;
export declare const InspectorInfoSubtitle: React.FC<{
    readonly children: React.ReactNode;
    readonly size?: 'default' | 'inspector';
}>;
