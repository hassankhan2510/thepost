"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetSelectedModalContext = exports.SelectedModalContext = void 0;
const react_1 = require("react");
// Keep modal state separate from its stable setter so opening a modal only
// updates consumers that need to render the selected modal.
exports.SelectedModalContext = (0, react_1.createContext)(null);
exports.SetSelectedModalContext = (0, react_1.createContext)({
    setSelectedModal: () => undefined,
});
