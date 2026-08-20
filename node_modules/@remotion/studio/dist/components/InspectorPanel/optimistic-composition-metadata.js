"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reconcilePendingCompositionMetadata = exports.acceptPendingCompositionMetadataValue = exports.failPendingCompositionMetadataValue = void 0;
const removePendingValue = ({ field, pending, }) => {
    const { [field]: _removed, ...remaining } = pending;
    return remaining;
};
const failPendingCompositionMetadataValue = ({ field, pending, value, }) => {
    if (pending[field] !== value) {
        return pending;
    }
    return removePendingValue({ field, pending });
};
exports.failPendingCompositionMetadataValue = failPendingCompositionMetadataValue;
const acceptPendingCompositionMetadataValue = ({ currentConfig, field, pending, value, }) => {
    if (pending[field] !== value) {
        return pending;
    }
    if (currentConfig !== value.baseline) {
        return removePendingValue({ field, pending });
    }
    return {
        ...pending,
        [field]: {
            ...value,
            status: 'awaiting-hmr',
        },
    };
};
exports.acceptPendingCompositionMetadataValue = acceptPendingCompositionMetadataValue;
const reconcilePendingCompositionMetadata = ({ currentConfig, pending, }) => {
    let reconciled = pending;
    for (const field of Object.keys(pending)) {
        const value = pending[field];
        if ((value === null || value === void 0 ? void 0 : value.status) === 'awaiting-hmr' && value.baseline !== currentConfig) {
            reconciled = removePendingValue({ field, pending: reconciled });
        }
    }
    return reconciled;
};
exports.reconcilePendingCompositionMetadata = reconcilePendingCompositionMetadata;
