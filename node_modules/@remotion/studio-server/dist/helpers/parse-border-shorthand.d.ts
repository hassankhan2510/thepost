export type ParsedBorderShorthand = {
    borderWidth: number;
    borderStyle: string;
    borderColor: string;
};
export declare const parseBorderShorthand: (value: string) => ParsedBorderShorthand | null;
