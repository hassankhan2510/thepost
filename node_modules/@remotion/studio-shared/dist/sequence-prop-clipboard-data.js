"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSequencePropClipboardData = exports.parseSequencePropClipboardDataResult = void 0;
const effect_clipboard_data_1 = require("./effect-clipboard-data");
const keyframe_clipboard_data_1 = require("./keyframe-clipboard-data");
const isRecord = (value) => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};
const parseSequencePropClipboardDataResult = (value) => {
    try {
        const parsed = JSON.parse(value);
        if (!isRecord(parsed) || parsed.remotionClipboard !== 'sequence-prop') {
            return { status: 'invalid' };
        }
        if (parsed.version !== 1) {
            return { status: 'unsupported-version', version: parsed.version };
        }
        if (parsed.type !== 'sequence-prop' ||
            typeof parsed.key !== 'string' ||
            !(0, keyframe_clipboard_data_1.isKeyframeClipboardFieldType)(parsed.fieldType) ||
            !(0, effect_clipboard_data_1.isEffectClipboardParam)(parsed.param)) {
            return { status: 'invalid' };
        }
        return {
            status: 'valid',
            data: {
                type: 'sequence-prop',
                version: 1,
                remotionClipboard: 'sequence-prop',
                key: parsed.key,
                fieldType: parsed.fieldType,
                param: (0, effect_clipboard_data_1.normalizeEffectClipboardParam)(parsed.param),
            },
        };
    }
    catch (_a) {
        return { status: 'invalid' };
    }
};
exports.parseSequencePropClipboardDataResult = parseSequencePropClipboardDataResult;
const parseSequencePropClipboardData = (value) => {
    const result = (0, exports.parseSequencePropClipboardDataResult)(value);
    return result.status === 'valid' ? result.data : null;
};
exports.parseSequencePropClipboardData = parseSequencePropClipboardData;
