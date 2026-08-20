"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOpenInNewWindowMenuItem = void 0;
const url_state_1 = require("../helpers/url-state");
const getOpenInNewWindowMenuItem = (route) => {
    return {
        id: 'open-in-new-window',
        keyHint: null,
        label: 'Open in new window',
        leftItem: null,
        onClick: () => {
            var _a, _b;
            const screen = window.screen;
            const width = Math.min(1200, Math.floor(screen.availWidth * 0.8));
            const height = Math.min(800, Math.floor(screen.availHeight * 0.8));
            const displayLeft = (_a = screen.availLeft) !== null && _a !== void 0 ? _a : 0;
            const displayTop = (_b = screen.availTop) !== null && _b !== void 0 ? _b : 0;
            const left = Math.round(Math.min(Math.max(window.screenX + (window.outerWidth - width) / 2, displayLeft), displayLeft + screen.availWidth - width));
            const top = Math.round(Math.min(Math.max(window.screenY + (window.outerHeight - height) / 2, displayTop), displayTop + screen.availHeight - height));
            window.open((0, url_state_1.getUrlForRoute)(route), '_blank', `popup,width=${width},height=${height},left=${left},top=${top}`);
        },
        quickSwitcherLabel: null,
        subMenu: null,
        type: 'item',
        value: 'open-in-new-window',
    };
};
exports.getOpenInNewWindowMenuItem = getOpenInNewWindowMenuItem;
