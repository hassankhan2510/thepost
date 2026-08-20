"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyRenderOutputToAsset = void 0;
const call_api_1 = require("../components/call-api");
const copyRenderOutputToAsset = ({ outputPath, assetPath, }) => {
    return (0, call_api_1.callApi)('/api/copy-render-output-to-asset', {
        outputPath,
        assetPath,
    });
};
exports.copyRenderOutputToAsset = copyRenderOutputToAsset;
