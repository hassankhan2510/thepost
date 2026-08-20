export type ParsedBorderRadiusShorthand = {
    borderTopLeftRadius: number;
    borderTopRightRadius: number;
    borderBottomRightRadius: number;
    borderBottomLeftRadius: number;
};
export declare const parseBorderRadiusShorthand: (value: unknown) => ParsedBorderRadiusShorthand | null;
