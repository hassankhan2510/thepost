"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldSubscribeToSourceFile = void 0;
const shouldSubscribeToSourceFile = (source) => {
    const normalized = source.replaceAll('\\', '/');
    if (normalized === '..' || normalized.startsWith('../')) {
        return false;
    }
    return !normalized.split('/').includes('node_modules');
};
exports.shouldSubscribeToSourceFile = shouldSubscribeToSourceFile;
