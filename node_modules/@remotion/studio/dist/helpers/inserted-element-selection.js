"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInsertedElementSelection = exports.subscribeToInsertedElementSelection = exports.clearInsertedElementSelection = exports.requestInsertedElementSelection = void 0;
let pendingSelection = null;
const listeners = new Set();
const requestInsertedElementSelection = (selection) => {
    pendingSelection = selection;
    for (const listener of listeners) {
        listener();
    }
};
exports.requestInsertedElementSelection = requestInsertedElementSelection;
const clearInsertedElementSelection = (selection) => {
    if (pendingSelection !== selection) {
        return;
    }
    pendingSelection = null;
    for (const listener of listeners) {
        listener();
    }
};
exports.clearInsertedElementSelection = clearInsertedElementSelection;
const subscribeToInsertedElementSelection = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};
exports.subscribeToInsertedElementSelection = subscribeToInsertedElementSelection;
const getInsertedElementSelection = () => pendingSelection;
exports.getInsertedElementSelection = getInsertedElementSelection;
