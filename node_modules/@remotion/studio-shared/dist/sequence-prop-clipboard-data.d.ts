import type { EffectClipboardParam } from './effect-clipboard-data';
import type { KeyframeClipboardFieldType } from './keyframe-clipboard-data';
export type SequencePropClipboardData = {
    readonly type: 'sequence-prop';
    readonly version: 1;
    readonly remotionClipboard: 'sequence-prop';
    readonly key: string;
    readonly fieldType: KeyframeClipboardFieldType;
    readonly param: EffectClipboardParam;
};
export type SequencePropClipboardDataParseResult = {
    readonly status: 'valid';
    readonly data: SequencePropClipboardData;
} | {
    readonly status: 'unsupported-version';
    readonly version: unknown;
} | {
    readonly status: 'invalid';
};
export declare const parseSequencePropClipboardDataResult: (value: string) => SequencePropClipboardDataParseResult;
export declare const parseSequencePropClipboardData: (value: string) => SequencePropClipboardData | null;
