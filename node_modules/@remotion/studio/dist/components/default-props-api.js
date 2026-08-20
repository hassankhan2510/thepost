"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsubscribeFromDefaultProps = exports.subscribeToDefaultProps = void 0;
const browser_studio_operations_1 = require("../helpers/browser-studio-operations");
const call_api_1 = require("./call-api");
const subscribeToDefaultProps = (request) => {
    const browserStudioOperations = (0, browser_studio_operations_1.getBrowserStudioOperations)();
    return browserStudioOperations
        ? browserStudioOperations.subscribeToDefaultProps(request)
        : (0, call_api_1.callApi)('/api/subscribe-to-default-props', request);
};
exports.subscribeToDefaultProps = subscribeToDefaultProps;
const unsubscribeFromDefaultProps = (request) => {
    const browserStudioOperations = (0, browser_studio_operations_1.getBrowserStudioOperations)();
    return browserStudioOperations
        ? browserStudioOperations.unsubscribeFromDefaultProps(request)
        : (0, call_api_1.callApi)('/api/unsubscribe-from-default-props', request);
};
exports.unsubscribeFromDefaultProps = unsubscribeFromDefaultProps;
