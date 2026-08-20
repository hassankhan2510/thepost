"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fieldsetLabel = exports.fieldSetText = exports.input = exports.rightRow = exports.label = exports.optionRow = void 0;
const colors_1 = require("../../helpers/colors");
exports.optionRow = {
    display: 'flex',
    flexDirection: 'row',
    minHeight: 40,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 4,
    paddingBottom: 4,
};
exports.label = {
    minWidth: 0,
    fontSize: 14,
    lineHeight: '40px',
    color: colors_1.LIGHT_TEXT,
    fontFamily: 'sans-serif',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
};
exports.rightRow = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    alignSelf: 'center',
    flex: 1,
    minWidth: 0,
};
exports.input = {
    minWidth: 0,
};
exports.fieldSetText = {
    color: colors_1.LIGHT_TEXT,
    fontSize: 14,
    fontFamily: 'monospace',
};
exports.fieldsetLabel = {
    ...exports.fieldSetText,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
};
