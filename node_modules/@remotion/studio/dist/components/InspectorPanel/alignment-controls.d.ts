export type AlignmentDirection = 'left' | 'center-h' | 'right' | 'top' | 'center-v' | 'bottom';
export declare const computeAlignedTranslate: ({ direction, elementRect, compositionRect, currentTranslateX, currentTranslateY, scale, }: {
    readonly direction: AlignmentDirection;
    readonly elementRect: DOMRect;
    readonly compositionRect: DOMRect;
    readonly currentTranslateX: number;
    readonly currentTranslateY: number;
    readonly scale: number;
}) => {
    x: number;
    y: number;
};
