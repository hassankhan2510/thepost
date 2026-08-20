"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStudioSelectionEnabled = exports.isStudioInteractivityEnabled = void 0;
const studio_runtime_config_1 = require("./studio-runtime-config");
const isStudioInteractivityEnabled = () => {
    return ((0, studio_runtime_config_1.getStudioInteractivityEnabled)() &&
        (typeof window === 'undefined' || !window.remotion_isReadOnlyStudio));
};
exports.isStudioInteractivityEnabled = isStudioInteractivityEnabled;
exports.isStudioSelectionEnabled = studio_runtime_config_1.getStudioInteractivityEnabled;
