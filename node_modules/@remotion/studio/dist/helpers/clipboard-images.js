"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClipboardImageFiles = exports.getUniqueClipboardImageName = exports.hasClipboardImage = void 0;
const getClipboardFiles = (clipboardData) => {
    const imageItems = Array.from(clipboardData.items).filter((item) => item.kind === 'file' && item.type.startsWith('image/'));
    if (imageItems.length > 0) {
        const files = imageItems
            .map((item) => item.getAsFile())
            .filter((file) => file !== null);
        if (files.length > 0) {
            return files;
        }
    }
    return Array.from(clipboardData.files).filter((file) => file.type.startsWith('image/'));
};
const hasClipboardImage = (clipboardData) => {
    return (Array.from(clipboardData.items).some((item) => item.kind === 'file' && item.type.startsWith('image/')) ||
        Array.from(clipboardData.files).some((file) => file.type.startsWith('image/')));
};
exports.hasClipboardImage = hasClipboardImage;
const getExtensionForMimeType = (mimeType) => {
    switch (mimeType) {
        case 'image/jpeg':
            return 'jpg';
        case 'image/svg+xml':
            return 'svg';
        default:
            return mimeType.startsWith('image/')
                ? mimeType.slice('image/'.length)
                : 'png';
    }
};
const getNameParts = ({ fileName, mimeType, }) => {
    const trimmedName = fileName.trim();
    const lastDot = trimmedName.lastIndexOf('.');
    if (lastDot > 0 && lastDot < trimmedName.length - 1) {
        return {
            base: trimmedName.slice(0, lastDot),
            extension: trimmedName.slice(lastDot + 1),
        };
    }
    return {
        base: 'pasted-image',
        extension: getExtensionForMimeType(mimeType),
    };
};
const getUniqueClipboardImageName = ({ existingFileNames, fileName, mimeType, }) => {
    const { base, extension } = getNameParts({ fileName, mimeType });
    let candidate = `${base}.${extension}`;
    let suffix = 1;
    while (existingFileNames.has(candidate)) {
        candidate = `${base}-${suffix}.${extension}`;
        suffix++;
    }
    return candidate;
};
exports.getUniqueClipboardImageName = getUniqueClipboardImageName;
const getClipboardImageFiles = ({ clipboardData, existingFileNames, }) => {
    const usedNames = new Set(existingFileNames);
    return getClipboardFiles(clipboardData).map((file) => {
        var _a;
        const candidate = (0, exports.getUniqueClipboardImageName)({
            existingFileNames: usedNames,
            fileName: (_a = file.name) !== null && _a !== void 0 ? _a : '',
            mimeType: file.type,
        });
        usedNames.add(candidate);
        if (candidate === file.name) {
            return file;
        }
        return new File([file.slice()], candidate, {
            type: file.type,
            lastModified: file.lastModified,
        });
    });
};
exports.getClipboardImageFiles = getClipboardImageFiles;
