"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatTimelineRotationFieldValue = void 0;
const timeline_field_display_utils_1 = require("./timeline-field-display-utils");
const timeline_rotation_utils_1 = require("./timeline-rotation-utils");
const formatTimelineRotationFieldValue = ({ decimalPlaces, fieldSchema, value, }) => {
    return (0, timeline_field_display_utils_1.formatTimelineFieldValueForDisplay)({
        fieldSchema,
        value: fieldSchema.type === 'rotation-css' &&
            typeof value === 'number' &&
            Number.isFinite(value)
            ? (0, timeline_rotation_utils_1.serializeCssRotation)(value, decimalPlaces)
            : value,
    });
};
exports.formatTimelineRotationFieldValue = formatTimelineRotationFieldValue;
