"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHECKER_BACKGROUND_COLOR = exports.CHECKER_BACKGROUND_POSITION = exports.CHECKER_BACKGROUND_SIZE = exports.CHECKER_BACKGROUND_IMAGE = void 0;
const colors_1 = require("../../helpers/colors"); // Checkerboard background used to indicate transparency in color swatches
// and the alpha slider. Rendered as a CSS gradient so we don't need an asset.
exports.CHECKER_BACKGROUND_IMAGE = colors_1.COLOR_PICKER_CHECKER_BACKGROUND_IMAGE;
exports.CHECKER_BACKGROUND_SIZE = '8px 8px';
exports.CHECKER_BACKGROUND_POSITION = '0 0, 0 4px, 4px -4px, -4px 0';
exports.CHECKER_BACKGROUND_COLOR = colors_1.COLOR_PICKER_CHECKER_BACKGROUND_COLOR;
