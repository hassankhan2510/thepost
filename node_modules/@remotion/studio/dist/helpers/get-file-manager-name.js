"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileManagerName = void 0;
const getFileManagerName = (platform) => {
    if (platform === 'darwin') {
        return 'Finder';
    }
    if (platform === 'win32') {
        return 'File Explorer';
    }
    return 'File Manager';
};
exports.getFileManagerName = getFileManagerName;
