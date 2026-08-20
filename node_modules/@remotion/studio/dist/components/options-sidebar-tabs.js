"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectOptionsSidebarInspectorPanel = exports.optionsSidebarTabs = void 0;
const react_1 = require("react");
exports.optionsSidebarTabs = (0, react_1.createRef)();
const selectOptionsSidebarInspectorPanel = () => {
    var _a;
    (_a = exports.optionsSidebarTabs.current) === null || _a === void 0 ? void 0 : _a.selectInspectorPanel();
};
exports.selectOptionsSidebarInspectorPanel = selectOptionsSidebarInspectorPanel;
