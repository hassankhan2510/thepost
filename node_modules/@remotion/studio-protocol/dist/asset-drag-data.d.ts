export type AssetDragData = {
    type: 'remotion-asset';
    version: 1;
    assetPath: string;
};
export declare const makeAssetDragData: (assetPath: string) => AssetDragData;
export declare const parseAssetDragData: (value: string) => AssetDragData | null;
