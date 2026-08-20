"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatFigmaClipboardErrorNotification = exports.formatFigmaClipboardError = exports.hasClipboardFigmaPayload = exports.getClipboardFigmaHtml = void 0;
const figmaMetaStart = '<!--(figmeta)';
const figmaMetaEnd = '(/figmeta)-->';
const figmaDataStart = '<!--(figma)';
const figmaDataEnd = '(/figma)-->';
const hasSection = ({ end, html, start, }) => {
    const startIndex = html.indexOf(start);
    return (startIndex !== -1 && html.indexOf(end, startIndex + start.length) !== -1);
};
const getClipboardFigmaHtml = (clipboardData) => {
    const html = clipboardData.getData('text/html');
    if (!hasSection({ end: figmaMetaEnd, html, start: figmaMetaStart }) ||
        !hasSection({ end: figmaDataEnd, html, start: figmaDataStart })) {
        return null;
    }
    return html;
};
exports.getClipboardFigmaHtml = getClipboardFigmaHtml;
const hasClipboardFigmaPayload = (clipboardData) => {
    return (0, exports.getClipboardFigmaHtml)(clipboardData) !== null;
};
exports.hasClipboardFigmaPayload = hasClipboardFigmaPayload;
const formatFigmaClipboardError = (reason) => {
    const withoutPrefix = reason
        .replace(/^(?:Cannot|Could not) import Figma selection:\s*/i, '')
        .trim();
    const message = withoutPrefix.toLowerCase() === 'clipboard scene is incomplete'
        ? 'Pasting images from Figma is not supported'
        : withoutPrefix;
    if (/[.!?]$/.test(message)) {
        return message;
    }
    return `${message}.`;
};
exports.formatFigmaClipboardError = formatFigmaClipboardError;
const formatFigmaClipboardErrorNotification = (reason) => {
    return `${(0, exports.formatFigmaClipboardError)(reason)} Try “Copy as SVG” in Figma and paste again.`;
};
exports.formatFigmaClipboardErrorNotification = formatFigmaClipboardErrorNotification;
