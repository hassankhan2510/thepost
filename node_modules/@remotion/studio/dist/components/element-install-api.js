"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.installElement = exports.prepareElementInstall = void 0;
const browser_studio_operations_1 = require("../helpers/browser-studio-operations");
const call_api_1 = require("./call-api");
const prepareElementInstall = (request) => {
    const browserStudioOperations = (0, browser_studio_operations_1.getBrowserStudioOperations)();
    return browserStudioOperations
        ? browserStudioOperations.prepareElementInstall(request)
        : (0, call_api_1.callApi)('/api/prepare-element-install', request);
};
exports.prepareElementInstall = prepareElementInstall;
const installElement = (request) => {
    const browserStudioOperations = (0, browser_studio_operations_1.getBrowserStudioOperations)();
    return browserStudioOperations
        ? browserStudioOperations.insertElement(request)
        : (0, call_api_1.callApi)('/api/insert-element', request);
};
exports.installElement = installElement;
