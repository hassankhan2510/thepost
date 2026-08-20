import type { ArrayExpression, CallExpression } from '@babel/types';
export type EffectArrayElement = {
    kind: 'call';
    callee: string;
    node: CallExpression;
} | {
    kind: 'unsupported';
    reason: 'not-call-expression' | 'spread';
};
export declare const enumerateEffectArrayElements: (arr: ArrayExpression) => EffectArrayElement[];
