"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasClipboardSvgMarkup = exports.getClipboardSvgMarkup = exports.extractSvgMarkup = void 0;
const svgOpeningTag = /^<svg(?:\s|>)/i;
const removeSvgPreamble = (value) => {
    let remaining = value.trim();
    while (true) {
        const withoutPreamble = remaining
            .replace(/^<\?xml[\s\S]*?\?>\s*/i, '')
            .replace(/^<!doctype[\s\S]*?>\s*/i, '')
            .replace(/^<!--[\s\S]*?-->\s*/, '');
        if (withoutPreamble === remaining) {
            return remaining;
        }
        remaining = withoutPreamble;
    }
};
const extractSvgMarkup = (value) => {
    const withoutPreamble = removeSvgPreamble(value);
    if (!svgOpeningTag.test(withoutPreamble)) {
        return null;
    }
    const closingTagIndex = withoutPreamble.toLowerCase().lastIndexOf('</svg>');
    if (closingTagIndex === -1) {
        return null;
    }
    const afterClosingTag = withoutPreamble.slice(closingTagIndex + '</svg>'.length);
    if (afterClosingTag.trim() !== '') {
        return null;
    }
    return withoutPreamble.slice(0, closingTagIndex + '</svg>'.length);
};
exports.extractSvgMarkup = extractSvgMarkup;
const getClipboardSvgMarkup = (clipboardData) => {
    for (const mimeType of ['text/plain', 'text/html']) {
        const markup = (0, exports.extractSvgMarkup)(clipboardData.getData(mimeType));
        if (markup !== null) {
            return markup;
        }
    }
    return null;
};
exports.getClipboardSvgMarkup = getClipboardSvgMarkup;
const hasClipboardSvgMarkup = (clipboardData) => {
    return (0, exports.getClipboardSvgMarkup)(clipboardData) !== null;
};
exports.hasClipboardSvgMarkup = hasClipboardSvgMarkup;
