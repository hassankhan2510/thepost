export type ParsedBackgroundShorthand = {
    backgroundAttachment: string;
    backgroundClip: string;
    backgroundColor: string;
    backgroundImage: string;
    backgroundOrigin: string;
    backgroundPosition: string;
    backgroundRepeat: string;
    backgroundSize: string;
};
export declare const parseBackgroundShorthand: (value: string) => ParsedBackgroundShorthand | null;
