"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderSequence = void 0;
const browser_studio_operations_1 = require("../helpers/browser-studio-operations");
const call_api_1 = require("./call-api");
const reorderSequence = (request) => {
    const browserStudioOperations = (0, browser_studio_operations_1.getBrowserStudioOperations)();
    return browserStudioOperations
        ? browserStudioOperations.reorderSequence(request)
        : (0, call_api_1.callApi)('/api/reorder-sequence', request);
};
exports.reorderSequence = reorderSequence;
