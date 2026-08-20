"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useIsFullscreen = void 0;
const react_1 = require("react");
const getIsFullscreen = () => {
    var _a;
    return Boolean((_a = document.fullscreenElement) !== null && _a !== void 0 ? _a : document
        .webkitFullscreenElement);
};
const useIsFullscreen = () => {
    const [isFullscreen, setIsFullscreen] = (0, react_1.useState)(getIsFullscreen);
    (0, react_1.useEffect)(() => {
        const onFullscreenChange = () => {
            setIsFullscreen(getIsFullscreen());
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        document.addEventListener('webkitfullscreenchange', onFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', onFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
        };
    }, []);
    return isFullscreen;
};
exports.useIsFullscreen = useIsFullscreen;
