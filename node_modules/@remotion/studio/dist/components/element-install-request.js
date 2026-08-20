"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeToElementInstallRequests = exports.enqueueElementInstallRequest = void 0;
const listeners = new Set();
const enqueueElementInstallRequest = (request) => {
    for (const listener of listeners) {
        listener(request);
    }
};
exports.enqueueElementInstallRequest = enqueueElementInstallRequest;
const subscribeToElementInstallRequests = (listener) => {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
};
exports.subscribeToElementInstallRequests = subscribeToElementInstallRequests;
