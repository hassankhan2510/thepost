"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNodeInMenuTree = exports.MenuTreeContext = exports.getNextMenuTreeId = void 0;
const react_1 = require("react");
let nextMenuTreeId = 0;
const getNextMenuTreeId = () => nextMenuTreeId++;
exports.getNextMenuTreeId = getNextMenuTreeId;
exports.MenuTreeContext = (0, react_1.createContext)(null);
const isNodeInMenuTree = (node, menuTreeId) => {
    const element = node instanceof Element ? node : node.parentElement;
    return ((element === null || element === void 0 ? void 0 : element.closest(`[data-remotion-menu-tree-id="${menuTreeId}"]`)) !== null);
};
exports.isNodeInMenuTree = isNodeInMenuTree;
