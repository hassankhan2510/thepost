"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMac = void 0;
exports.isMac = typeof window !== 'undefined' && window.navigator.platform.startsWith('Mac');
