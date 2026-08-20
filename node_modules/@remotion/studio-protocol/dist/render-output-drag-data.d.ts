export type RenderOutputDragData = {
    type: 'remotion-render-output';
    version: 1;
    outputPath: string;
    fileName: string;
};
export declare const makeRenderOutputDragData: ({ outputPath, fileName, }: {
    outputPath: string;
    fileName: string;
}) => RenderOutputDragData;
export declare const parseRenderOutputDragData: (value: string) => RenderOutputDragData | null;
