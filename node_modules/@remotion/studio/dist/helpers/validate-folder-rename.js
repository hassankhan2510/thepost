"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFolderRename = void 0;
const validate_new_folder_name_1 = require("./validate-new-folder-name");
const validateFolderRename = ({ folders, newName, originalName, parentName, }) => {
    if (newName === originalName) {
        return null;
    }
    return (0, validate_new_folder_name_1.validateNewFolderName)({ folders, newName, parentName });
};
exports.validateFolderRename = validateFolderRename;
