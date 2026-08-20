"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeCssRotation = exports.serializeCssRotationFromEuler = exports.serializeCssRotation3d = exports.parseCssRotationToEuler = exports.parseCssRotationToDegrees = exports.parseCssRotation = void 0;
const timeline_field_utils_1 = require("./timeline-field-utils");
const unitPattern = /^([+-]?(?:\d+\.?\d*|\.\d+))(deg|rad|turn|grad)$/;
const unitToDegrees = {
    deg: 1,
    rad: 180 / Math.PI,
    turn: 360,
    grad: 360 / 400,
};
const parseCssRotation = (value) => {
    const trimmed = value.trim();
    const bareAngle = trimmed.match(unitPattern);
    if (bareAngle) {
        return {
            axis: [0, 0, 1],
            degrees: (0, timeline_field_utils_1.normalizeTimelineNumber)(Number(bareAngle[1]) * unitToDegrees[bareAngle[2]]),
        };
    }
    const keywordAxis = /^(x|y|z)\s+(.+)$/i.exec(trimmed);
    if (keywordAxis) {
        const keywordAngle = keywordAxis[2].match(unitPattern);
        if (!keywordAngle) {
            return null;
        }
        const keywordAxisName = keywordAxis[1].toLowerCase();
        return {
            axis: keywordAxisName === 'x'
                ? [1, 0, 0]
                : keywordAxisName === 'y'
                    ? [0, 1, 0]
                    : [0, 0, 1],
            degrees: (0, timeline_field_utils_1.normalizeTimelineNumber)(Number(keywordAngle[1]) * unitToDegrees[keywordAngle[2]]),
        };
    }
    const vectorAxis = /^(\S+)\s+(\S+)\s+(\S+)\s+(.+)$/.exec(trimmed);
    if (!vectorAxis) {
        return null;
    }
    const vectorAxisComponents = [
        Number(vectorAxis[1]),
        Number(vectorAxis[2]),
        Number(vectorAxis[3]),
    ];
    const vectorAngle = vectorAxis[4].match(unitPattern);
    if (!vectorAxisComponents.every(Number.isFinite) || !vectorAngle) {
        return null;
    }
    return {
        axis: vectorAxisComponents,
        degrees: (0, timeline_field_utils_1.normalizeTimelineNumber)(Number(vectorAngle[1]) * unitToDegrees[vectorAngle[2]]),
    };
};
exports.parseCssRotation = parseCssRotation;
const parseCssRotationToDegrees = (value) => {
    const parsed = (0, exports.parseCssRotation)(value);
    if (parsed) {
        return parsed.degrees;
    }
    if (typeof DOMMatrix === 'undefined') {
        return 0;
    }
    try {
        const m = new DOMMatrix(`rotate(${value})`);
        return (0, timeline_field_utils_1.normalizeTimelineNumber)(Math.atan2(m.b, m.a) * (180 / Math.PI));
    }
    catch (_a) {
        return 0;
    }
};
exports.parseCssRotationToDegrees = parseCssRotationToDegrees;
const parseCssRotationToEuler = (value) => {
    const parsed = (0, exports.parseCssRotation)(value);
    if (parsed === null) {
        return [0, 0, (0, exports.parseCssRotationToDegrees)(value)];
    }
    const [axisX, axisY, axisZ] = parsed.axis;
    if (parsed.degrees === 0) {
        return [0, 0, 0];
    }
    if (axisY === 0 && axisZ === 0 && axisX !== 0) {
        return [Math.sign(axisX) * parsed.degrees, 0, 0];
    }
    if (axisX === 0 && axisZ === 0 && axisY !== 0) {
        return [0, Math.sign(axisY) * parsed.degrees, 0];
    }
    if (axisX === 0 && axisY === 0 && axisZ !== 0) {
        return [0, 0, Math.sign(axisZ) * parsed.degrees];
    }
    const axisLength = Math.hypot(axisX, axisY, axisZ);
    if (axisLength === 0) {
        return [0, 0, 0];
    }
    const halfAngle = (parsed.degrees * Math.PI) / 360;
    const sinHalfAngle = Math.sin(halfAngle);
    const quaternionX = (axisX / axisLength) * sinHalfAngle;
    const quaternionY = (axisY / axisLength) * sinHalfAngle;
    const quaternionZ = (axisZ / axisLength) * sinHalfAngle;
    const quaternionW = Math.cos(halfAngle);
    // Decompose the rotation using the same X → Y → Z order used when serializing.
    const matrix11 = 1 - 2 * (quaternionY * quaternionY + quaternionZ * quaternionZ);
    const matrix12 = 2 * (quaternionX * quaternionY - quaternionZ * quaternionW);
    const matrix13 = 2 * (quaternionX * quaternionZ + quaternionY * quaternionW);
    const matrix22 = 1 - 2 * (quaternionX * quaternionX + quaternionZ * quaternionZ);
    const matrix23 = 2 * (quaternionY * quaternionZ - quaternionX * quaternionW);
    const matrix32 = 2 * (quaternionY * quaternionZ + quaternionX * quaternionW);
    const matrix33 = 1 - 2 * (quaternionX * quaternionX + quaternionY * quaternionY);
    const clampedMatrix13 = Math.max(-1, Math.min(1, matrix13));
    const rotationY = Math.asin(clampedMatrix13);
    const rotationX = Math.abs(clampedMatrix13) < 0.9999999
        ? Math.atan2(-matrix23, matrix33)
        : Math.atan2(matrix32, matrix22);
    const rotationZ = Math.abs(clampedMatrix13) < 0.9999999 ? Math.atan2(-matrix12, matrix11) : 0;
    return [rotationX, rotationY, rotationZ].map((rotation) => (0, timeline_field_utils_1.normalizeTimelineNumber)(rotation * (180 / Math.PI)));
};
exports.parseCssRotationToEuler = parseCssRotationToEuler;
const serializeCssRotation3d = ({ axis, degrees, decimalPlaces = 6, }) => {
    const factor = 10 ** decimalPlaces;
    const values = [...axis, degrees].map((value) => {
        const rounded = Math.round((0, timeline_field_utils_1.normalizeTimelineNumber)(value) * factor) / factor;
        return Object.is(rounded, -0) ? 0 : rounded;
    });
    return `${values[0]} ${values[1]} ${values[2]} ${values[3]}deg`;
};
exports.serializeCssRotation3d = serializeCssRotation3d;
const serializeCssRotationFromEuler = ({ rotation, decimalPlaces = 6, }) => {
    const [rotationX, rotationY, rotationZ] = rotation.map((value) => (0, timeline_field_utils_1.normalizeTimelineNumber)(value));
    if (rotationY === 0 && rotationZ === 0) {
        return rotationX === 0
            ? (0, exports.serializeCssRotation)(0, decimalPlaces)
            : `x ${(0, exports.serializeCssRotation)(rotationX, decimalPlaces)}`;
    }
    if (rotationX === 0 && rotationZ === 0) {
        return `y ${(0, exports.serializeCssRotation)(rotationY, decimalPlaces)}`;
    }
    if (rotationX === 0 && rotationY === 0) {
        return (0, exports.serializeCssRotation)(rotationZ, decimalPlaces);
    }
    const halfRotationX = (rotationX * Math.PI) / 360;
    const halfRotationY = (rotationY * Math.PI) / 360;
    const halfRotationZ = (rotationZ * Math.PI) / 360;
    const sinX = Math.sin(halfRotationX);
    const cosX = Math.cos(halfRotationX);
    const sinY = Math.sin(halfRotationY);
    const cosY = Math.cos(halfRotationY);
    const sinZ = Math.sin(halfRotationZ);
    const cosZ = Math.cos(halfRotationZ);
    // Compose the three editable angles into the axis-angle form CSS rotate accepts.
    const quaternionX = sinX * cosY * cosZ + cosX * sinY * sinZ;
    const quaternionY = cosX * sinY * cosZ - sinX * cosY * sinZ;
    const quaternionZ = cosX * cosY * sinZ + sinX * sinY * cosZ;
    const quaternionW = cosX * cosY * cosZ - sinX * sinY * sinZ;
    const angle = 2 * Math.acos(Math.max(-1, Math.min(1, quaternionW)));
    const sinHalfAngle = Math.sqrt(Math.max(0, 1 - quaternionW * quaternionW));
    if (sinHalfAngle < 0.0000001) {
        return (0, exports.serializeCssRotation)(0, decimalPlaces);
    }
    return (0, exports.serializeCssRotation3d)({
        axis: [
            quaternionX / sinHalfAngle,
            quaternionY / sinHalfAngle,
            quaternionZ / sinHalfAngle,
        ],
        degrees: angle * (180 / Math.PI),
        decimalPlaces,
    });
};
exports.serializeCssRotationFromEuler = serializeCssRotationFromEuler;
const serializeCssRotation = (value, decimalPlaces = 6) => {
    const factor = 10 ** decimalPlaces;
    const rounded = Math.round((0, timeline_field_utils_1.normalizeTimelineNumber)(value) * factor) / factor;
    return `${Object.is(rounded, -0) ? 0 : rounded}deg`;
};
exports.serializeCssRotation = serializeCssRotation;
