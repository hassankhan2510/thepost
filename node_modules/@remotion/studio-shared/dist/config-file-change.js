"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfigFileChangeMessage = void 0;
const getConfigFileChangeMessage = (changeType) => {
    if (changeType === 'restart') {
        return 'Restart Studio to apply config file changes';
    }
    if (changeType === 'reload') {
        return 'Reload page to apply config file changes';
    }
    return 'Config file changed';
};
exports.getConfigFileChangeMessage = getConfigFileChangeMessage;
