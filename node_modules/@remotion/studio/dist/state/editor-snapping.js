"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorSnappingContext = exports.loadEditorSnappingOption = exports.persistEditorSnappingOption = void 0;
const react_1 = require("react");
const key = 'remotion.editorSnapping';
const persistEditorSnappingOption = (option) => {
    localStorage.setItem(key, String(option));
};
exports.persistEditorSnappingOption = persistEditorSnappingOption;
const loadEditorSnappingOption = () => {
    const item = localStorage.getItem(key);
    return item !== 'false';
};
exports.loadEditorSnappingOption = loadEditorSnappingOption;
exports.EditorSnappingContext = (0, react_1.createContext)({
    editorSnapping: true,
    setEditorSnapping: () => undefined,
});
