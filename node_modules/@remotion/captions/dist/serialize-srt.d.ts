import type { Caption } from './caption';
export type SerializeSrtInput = {
    lines: Caption[][];
};
export declare const serializeSrt: ({ lines }: SerializeSrtInput) => string;
