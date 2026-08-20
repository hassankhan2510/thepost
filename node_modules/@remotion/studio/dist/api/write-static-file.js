"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeStaticFile = void 0;
const browser_studio_operations_1 = require("../helpers/browser-studio-operations");
const writeStaticFile = async ({ contents, filePath, }) => {
    if (filePath.includes('\\')) {
        return Promise.reject(new Error('File path cannot contain backslashes'));
    }
    const browserStudioOperations = (0, browser_studio_operations_1.getBrowserStudioOperations)();
    if (browserStudioOperations) {
        return browserStudioOperations.writeStaticFile({ contents, filePath });
    }
    if (window.remotion_isReadOnlyStudio) {
        throw new Error('writeStaticFile() is not available in read-only Studio');
    }
    const url = new URL(`${window.remotion_staticBase}/api/add-asset`, window.location.origin);
    url.search = new URLSearchParams({
        filePath,
    }).toString();
    const response = await fetch(url, {
        method: 'POST',
        body: contents,
    });
    if (!response.ok) {
        const jsonResponse = await response.json();
        throw new Error(jsonResponse.error);
    }
};
exports.writeStaticFile = writeStaticFile;
