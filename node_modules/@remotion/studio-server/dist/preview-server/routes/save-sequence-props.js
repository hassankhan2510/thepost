"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveSequencePropsHandler = exports.shouldSuppressHmrForSequencePropEdits = exports.convertSequencePropEditToCodemodChange = void 0;
const node_fs_1 = require("node:fs");
const renderer_1 = require("@remotion/renderer");
const studio_shared_1 = require("@remotion/studio-shared");
const update_inline_caption_patches_1 = require("../../codemods/update-inline-caption-patches");
const update_keyframes_1 = require("../../codemods/update-keyframes/update-keyframes");
const update_sequence_props_1 = require("../../codemods/update-sequence-props/update-sequence-props");
const file_watcher_1 = require("../../file-watcher");
const resolve_file_inside_project_1 = require("../../helpers/resolve-file-inside-project");
const undo_stack_1 = require("../undo-stack");
const watch_ignore_next_change_1 = require("../watch-ignore-next-change");
const can_update_sequence_props_1 = require("./can-update-sequence-props");
const log_effect_update_1 = require("./log-updates/log-effect-update");
const log_update_1 = require("./log-updates/log-update");
const source_file_write_queue_1 = require("./source-file-write-queue");
const parseSequencePropEditValue = (value) => {
    if (value.type === 'undefined') {
        return undefined;
    }
    return JSON.parse(value.serialized);
};
const stringifySequencePropEditValue = (value) => {
    if (value === undefined) {
        return 'undefined';
    }
    return JSON.stringify(value);
};
const stringifySequencePropSourceEdit = (sourceEdit, fallbackValue) => {
    if ((sourceEdit === null || sourceEdit === void 0 ? void 0 : sourceEdit.type) !== 'clipboard-param') {
        return stringifySequencePropEditValue(fallbackValue);
    }
    if (sourceEdit.param.type === 'static') {
        return stringifySequencePropEditValue(sourceEdit.param.value);
    }
    return `${sourceEdit.param.interpolationFunction}(frame, ${JSON.stringify(sourceEdit.param.keyframes.map((keyframe) => keyframe.frame))}, ${JSON.stringify(sourceEdit.param.keyframes.map((keyframe) => keyframe.value))})`;
};
const groupBy = (items, getKey) => {
    var _a;
    const groups = new Map();
    for (const item of items) {
        const key = getKey(item);
        const group = (_a = groups.get(key)) !== null && _a !== void 0 ? _a : [];
        group.push(item);
        groups.set(key, group);
    }
    return [...groups.values()];
};
const convertSequencePropEditToCodemodChange = (edit) => {
    var _a, _b;
    return {
        nodePath: edit.nodePath.nodePath,
        updates: [
            {
                key: edit.key,
                value: edit.value,
                defaultValue: edit.defaultValue,
                googleFont: ((_a = edit.sourceEdit) === null || _a === void 0 ? void 0 : _a.type) === 'google-font' ? edit.sourceEdit.font : null,
                clipboardParam: ((_b = edit.sourceEdit) === null || _b === void 0 ? void 0 : _b.type) === 'clipboard-param'
                    ? edit.sourceEdit.param
                    : null,
            },
        ],
        schema: edit.schema,
        videoConfigValues: edit.nodePath.videoConfigValues,
    };
};
exports.convertSequencePropEditToCodemodChange = convertSequencePropEditToCodemodChange;
const shouldSuppressHmrForSequencePropEdits = (edits) => {
    return edits.every((edit) => edit.key !== 'showInTimeline' &&
        (edit.sourceEdit === null || edit.sourceEdit === undefined));
};
exports.shouldSuppressHmrForSequencePropEdits = shouldSuppressHmrForSequencePropEdits;
const saveSequencePropsHandler = ({ input: { edits, addedKeyframes, movedKeyframes, captionPatches = [], clientId, undoLabel, redoLabel, }, remotionRoot, logLevel, }) => (0, source_file_write_queue_1.withSourceFileWriteQueue)(async () => {
    var _a, _b, _c, _d, _e;
    const keyframesToAdd = addedKeyframes === null ? [] : addedKeyframes;
    const keyframesToMove = movedKeyframes === null
        ? { sequenceKeyframes: [], effectKeyframes: [] }
        : movedKeyframes;
    const totalKeyframeMoves = keyframesToMove.sequenceKeyframes.length +
        keyframesToMove.effectKeyframes.length;
    if (edits.length === 0 &&
        captionPatches.length === 0 &&
        keyframesToAdd.length === 0 &&
        totalKeyframeMoves === 0) {
        throw new Error('No sequence prop edits to save');
    }
    renderer_1.RenderInternals.Log.trace({ indent: false, logLevel }, `[save-sequence-props] Received request with ${edits.length} edit(s), ${captionPatches.length} caption patch request(s), ${keyframesToAdd.length} added keyframe(s), and ${totalKeyframeMoves} moved keyframe(s)`);
    const editGroups = new Map();
    for (const [index, edit] of edits.entries()) {
        const parsedValue = parseSequencePropEditValue(edit.value);
        const parsedDefaultValue = edit.defaultValue !== null ? JSON.parse(edit.defaultValue) : null;
        const { absolutePath, fileRelativeToRoot } = (0, resolve_file_inside_project_1.resolveFileInsideProject)({
            remotionRoot,
            fileName: edit.fileName,
            action: 'modify',
        });
        const group = (_a = editGroups.get(absolutePath)) !== null && _a !== void 0 ? _a : {
            fileRelativeToRoot,
            edits: [],
            captionPatches: [],
            addedKeyframes: [],
            movedSequenceKeyframes: [],
            effectKeyframes: [],
        };
        group.edits.push({
            index,
            fileName: edit.fileName,
            nodePath: edit.nodePath,
            key: edit.key,
            value: parsedValue,
            valueString: stringifySequencePropSourceEdit(edit.sourceEdit, parsedValue),
            defaultValue: parsedDefaultValue,
            defaultValueString: parsedDefaultValue !== null
                ? JSON.stringify(parsedDefaultValue)
                : null,
            schema: edit.schema,
            sourceEdit: edit.sourceEdit,
        });
        editGroups.set(absolutePath, group);
    }
    for (const captionPatch of captionPatches) {
        const { absolutePath, fileRelativeToRoot } = (0, resolve_file_inside_project_1.resolveFileInsideProject)({
            remotionRoot,
            fileName: captionPatch.fileName,
            action: 'modify',
        });
        const group = (_b = editGroups.get(absolutePath)) !== null && _b !== void 0 ? _b : {
            fileRelativeToRoot,
            edits: [],
            captionPatches: [],
            addedKeyframes: [],
            movedSequenceKeyframes: [],
            effectKeyframes: [],
        };
        group.captionPatches.push(captionPatch);
        editGroups.set(absolutePath, group);
    }
    for (const keyframe of keyframesToAdd) {
        const { absolutePath, fileRelativeToRoot } = (0, resolve_file_inside_project_1.resolveFileInsideProject)({
            remotionRoot,
            fileName: keyframe.fileName,
            action: 'modify',
        });
        const group = (_c = editGroups.get(absolutePath)) !== null && _c !== void 0 ? _c : {
            fileRelativeToRoot,
            edits: [],
            captionPatches: [],
            addedKeyframes: [],
            movedSequenceKeyframes: [],
            effectKeyframes: [],
        };
        group.addedKeyframes.push(keyframe);
        editGroups.set(absolutePath, group);
    }
    for (const [index, keyframe,] of keyframesToMove.sequenceKeyframes.entries()) {
        const { absolutePath, fileRelativeToRoot } = (0, resolve_file_inside_project_1.resolveFileInsideProject)({
            remotionRoot,
            fileName: keyframe.fileName,
            action: 'modify',
        });
        const group = (_d = editGroups.get(absolutePath)) !== null && _d !== void 0 ? _d : {
            fileRelativeToRoot,
            edits: [],
            captionPatches: [],
            addedKeyframes: [],
            movedSequenceKeyframes: [],
            effectKeyframes: [],
        };
        group.movedSequenceKeyframes.push({ ...keyframe, index });
        editGroups.set(absolutePath, group);
    }
    for (const [index, keyframe] of keyframesToMove.effectKeyframes.entries()) {
        const { absolutePath, fileRelativeToRoot } = (0, resolve_file_inside_project_1.resolveFileInsideProject)({
            remotionRoot,
            fileName: keyframe.fileName,
            action: 'modify',
        });
        const group = (_e = editGroups.get(absolutePath)) !== null && _e !== void 0 ? _e : {
            fileRelativeToRoot,
            edits: [],
            captionPatches: [],
            addedKeyframes: [],
            movedSequenceKeyframes: [],
            effectKeyframes: [],
        };
        group.effectKeyframes.push({ ...keyframe, index });
        editGroups.set(absolutePath, group);
    }
    const snapshots = [];
    const outputByPath = new Map();
    const statusAstByPath = new Map();
    const resultByIndex = new Map();
    const updatedNodePaths = new Map();
    const sequenceKeyframeLogs = [];
    const captionPatchLogs = [];
    const effectKeyframeLogs = [];
    for (const [absolutePath, group] of editGroups) {
        const fileContents = (0, node_fs_1.readFileSync)(absolutePath, 'utf-8');
        let output = fileContents;
        const cachedStatusAst = group.edits.length > 0
            ? (0, can_update_sequence_props_1.takeCachedSequencePropsStatusAst)(fileContents)
            : null;
        let sequencePropsAst = null;
        let firstLogLine = Number.POSITIVE_INFINITY;
        if (group.edits.length > 0) {
            const { output: sequencePropsOutput, formatted, results: updateResults, ast, } = await (0, update_sequence_props_1.updateMultipleSequenceProps)({
                input: output,
                changes: group.edits.map(exports.convertSequencePropEditToCodemodChange),
                prettierConfigOverride: null,
                ast: cachedStatusAst !== null && cachedStatusAst !== void 0 ? cachedStatusAst : undefined,
            });
            output = sequencePropsOutput;
            sequencePropsAst = ast;
            const firstUpdate = updateResults[0];
            if (firstUpdate) {
                firstLogLine = Math.min(firstLogLine, firstUpdate.logLine);
            }
            for (const [resultIndex, result] of updateResults.entries()) {
                const edit = group.edits[resultIndex];
                resultByIndex.set(edit.index, {
                    oldValueString: result.oldValueStrings[0],
                    logLine: result.logLine,
                    removedProps: result.removedProps,
                    formatted,
                    newNodePath: result.newNodePath,
                });
                updatedNodePaths.set(`${absolutePath}:${JSON.stringify(edit.nodePath.nodePath)}`, result.newNodePath);
            }
        }
        for (const captionPatchRequest of group.captionPatches) {
            const result = (0, update_inline_caption_patches_1.updateInlineCaptionPatches)({
                input: output,
                nodePath: captionPatchRequest.nodePath.nodePath,
                patches: captionPatchRequest.patches,
            });
            output = result.output;
            firstLogLine = Math.min(firstLogLine, result.logLine);
            for (const [index, patch] of captionPatchRequest.patches.entries()) {
                const changedFields = result.changedFields[index];
                if (!changedFields) {
                    throw new Error('Could not determine changed caption fields');
                }
                captionPatchLogs.push({
                    fileRelativeToRoot: group.fileRelativeToRoot,
                    line: result.logLine,
                    index: patch.index,
                    oldValueString: changedFields
                        .map((field) => `${field}: ${patch.before[field]}`)
                        .join(', '),
                    newValueString: changedFields
                        .map((field) => `${field}: ${patch.changes[field]}`)
                        .join(', '),
                });
            }
        }
        for (const keyframeGroup of groupBy(group.addedKeyframes, (keyframe) => JSON.stringify(keyframe.nodePath.nodePath))) {
            const [firstSequenceKeyframe] = keyframeGroup;
            if (!firstSequenceKeyframe) {
                continue;
            }
            const updates = keyframeGroup.map((keyframe) => ({
                key: keyframe.key,
                operation: {
                    type: 'add',
                    frame: keyframe.frame,
                    value: JSON.parse(keyframe.value),
                },
            }));
            const result = await (0, update_keyframes_1.updateSequenceKeyframes)({
                input: output,
                nodePath: firstSequenceKeyframe.nodePath.nodePath,
                schema: firstSequenceKeyframe.schema,
                videoConfigValues: firstSequenceKeyframe.nodePath.videoConfigValues,
                updates,
            });
            output = result.output;
            firstLogLine = Math.min(firstLogLine, result.logLine);
            for (const [updateIndex, update] of updates.entries()) {
                sequenceKeyframeLogs.push({
                    fileRelativeToRoot: group.fileRelativeToRoot,
                    line: result.logLine,
                    key: update.key,
                    oldValueString: result.oldValueStrings[updateIndex],
                    newValueString: result.newValueStrings[updateIndex],
                    formatted: result.formatted,
                });
            }
        }
        for (const keyframeGroup of groupBy(group.movedSequenceKeyframes, (keyframe) => JSON.stringify(keyframe.nodePath.nodePath))) {
            const [firstSequenceKeyframe] = keyframeGroup;
            if (!firstSequenceKeyframe) {
                continue;
            }
            const updates = groupBy(keyframeGroup, (keyframe) => keyframe.key).map((keyframes) => {
                const [firstMove] = keyframes;
                if (!firstMove) {
                    throw new Error('Expected keyframe');
                }
                return {
                    key: firstMove.key,
                    operation: {
                        type: 'move',
                        moves: keyframes.map((keyframe) => ({
                            fromFrame: keyframe.fromFrame,
                            toFrame: keyframe.toFrame,
                        })),
                    },
                };
            });
            const result = await (0, update_keyframes_1.updateSequenceKeyframes)({
                input: output,
                nodePath: firstSequenceKeyframe.nodePath.nodePath,
                schema: firstSequenceKeyframe.schema,
                videoConfigValues: firstSequenceKeyframe.nodePath.videoConfigValues,
                updates,
            });
            output = result.output;
            firstLogLine = Math.min(firstLogLine, result.logLine);
            for (const [updateIndex, update] of updates.entries()) {
                sequenceKeyframeLogs.push({
                    fileRelativeToRoot: group.fileRelativeToRoot,
                    line: result.logLine,
                    key: update.key,
                    oldValueString: result.oldValueStrings[updateIndex],
                    newValueString: result.newValueStrings[updateIndex],
                    formatted: result.formatted,
                });
            }
        }
        for (const keyframeGroup of groupBy(group.effectKeyframes, (keyframe) => `${JSON.stringify(keyframe.sequenceNodePath.nodePath)}:${keyframe.effectIndex}`)) {
            const [firstEffectKeyframe] = keyframeGroup;
            if (!firstEffectKeyframe) {
                continue;
            }
            const updates = groupBy(keyframeGroup, (keyframe) => keyframe.key).map((keyframes) => {
                const [firstMove] = keyframes;
                if (!firstMove) {
                    throw new Error('Expected keyframe');
                }
                return {
                    key: firstMove.key,
                    operation: {
                        type: 'move',
                        moves: keyframes.map((keyframe) => ({
                            fromFrame: keyframe.fromFrame,
                            toFrame: keyframe.toFrame,
                        })),
                    },
                };
            });
            const result = await (0, update_keyframes_1.updateEffectKeyframes)({
                input: output,
                sequenceNodePath: firstEffectKeyframe.sequenceNodePath.nodePath,
                effectIndex: firstEffectKeyframe.effectIndex,
                schema: firstEffectKeyframe.schema,
                videoConfigValues: firstEffectKeyframe.sequenceNodePath.videoConfigValues,
                updates,
            });
            output = result.output;
            firstLogLine = Math.min(firstLogLine, result.logLine);
            for (const [updateIndex, update] of updates.entries()) {
                effectKeyframeLogs.push({
                    fileRelativeToRoot: group.fileRelativeToRoot,
                    line: result.logLine,
                    effectName: result.effectCallee,
                    propKey: update.key,
                    oldValueString: result.oldValueStrings[updateIndex],
                    newValueString: result.newValueStrings[updateIndex],
                    formatted: result.formatted,
                });
            }
        }
        if (sequencePropsAst &&
            group.captionPatches.length === 0 &&
            group.addedKeyframes.length === 0 &&
            group.movedSequenceKeyframes.length === 0 &&
            group.effectKeyframes.length === 0) {
            statusAstByPath.set(absolutePath, sequencePropsAst);
        }
        outputByPath.set(absolutePath, output);
        snapshots.push({
            filePath: absolutePath,
            oldContents: fileContents,
            newContents: output,
            logLine: Number.isFinite(firstLogLine) ? firstLogLine : 1,
        });
    }
    const undoMessage = `↩️  ${undoLabel}`;
    const redoMessage = `↪️  ${redoLabel}`;
    const suppressHmr = captionPatches.length === 0 &&
        (0, exports.shouldSuppressHmrForSequencePropEdits)(edits);
    (0, undo_stack_1.pushTransactionToUndoStack)({
        snapshots: snapshots.map((snapshot) => ({
            ...snapshot,
            nodePathRemappings: null,
        })),
        logLevel,
        remotionRoot,
        description: { undoMessage, redoMessage },
        entryType: 'sequence-props',
        suppressHmrOnFileRestore: suppressHmr,
    });
    for (const [absolutePath, output] of outputByPath) {
        (0, undo_stack_1.suppressUndoStackInvalidation)(absolutePath);
        if (suppressHmr) {
            (0, watch_ignore_next_change_1.suppressBundlerUpdateForFile)(absolutePath);
        }
        (0, file_watcher_1.writeFileAndNotifyFileWatchers)({
            file: absolutePath,
            content: output,
            originatorClientId: clientId,
            metadata: null,
        });
    }
    for (const { edits: groupEdits, fileRelativeToRoot } of editGroups.values()) {
        for (const edit of groupEdits) {
            const result = resultByIndex.get(edit.index);
            if (!result) {
                throw new Error('Could not compute sequence prop edit result');
            }
            (0, log_update_1.logUpdate)({
                fileRelativeToRoot,
                line: result.logLine,
                key: edit.key,
                oldValueString: result.oldValueString,
                newValueString: edit.valueString,
                defaultValueString: edit.defaultValueString,
                formatted: result.formatted,
                logLevel,
                removedProps: result.removedProps,
                addedProps: [],
            });
        }
    }
    for (const log of captionPatchLogs) {
        (0, log_update_1.logUpdate)({
            fileRelativeToRoot: log.fileRelativeToRoot,
            line: log.line,
            key: `captions[${log.index}]`,
            oldValueString: log.oldValueString,
            newValueString: log.newValueString,
            defaultValueString: null,
            formatted: true,
            logLevel,
            removedProps: [],
            addedProps: [],
        });
    }
    for (const log of sequenceKeyframeLogs) {
        (0, log_update_1.logUpdate)({
            fileRelativeToRoot: log.fileRelativeToRoot,
            line: log.line,
            key: log.key,
            oldValueString: log.oldValueString,
            newValueString: log.newValueString,
            defaultValueString: null,
            formatted: log.formatted,
            logLevel,
            removedProps: [],
            addedProps: [],
        });
    }
    for (const log of effectKeyframeLogs) {
        (0, log_effect_update_1.logEffectUpdate)({
            fileRelativeToRoot: log.fileRelativeToRoot,
            line: log.line,
            effectName: log.effectName,
            propKey: log.propKey,
            oldValueString: log.oldValueString,
            newValueString: log.newValueString,
            defaultValueString: null,
            formatted: log.formatted,
            logLevel,
            removedProps: [],
            addedProps: [],
        });
    }
    (0, undo_stack_1.printUndoHint)(logLevel);
    const statusTargets = [
        ...new Map([...edits, ...captionPatches, ...keyframesToAdd].map((target) => [
            JSON.stringify(target.nodePath),
            target,
        ])).values(),
    ];
    const results = statusTargets.map((target) => {
        var _a;
        const { absolutePath } = (0, resolve_file_inside_project_1.resolveFileInsideProject)({
            remotionRoot,
            fileName: target.fileName,
            action: 'modify',
        });
        const output = outputByPath.get(absolutePath);
        if (!output) {
            throw new Error('Could not compute sequence prop edit status');
        }
        const statusInput = {
            keys: (0, studio_shared_1.getAllSchemaKeys)(target.schema),
            assetKeys: (0, studio_shared_1.getAssetSchemaKeys)(target.schema),
            nodePath: (_a = updatedNodePaths.get(`${absolutePath}:${JSON.stringify(target.nodePath.nodePath)}`)) !== null && _a !== void 0 ? _a : target.nodePath.nodePath,
            componentIdentity: null,
            effects: [],
            videoConfigValues: target.nodePath.videoConfigValues,
        };
        const statusAst = statusAstByPath.get(absolutePath);
        const newStatus = statusAst
            ? (0, can_update_sequence_props_1.computeSequencePropsStatusFromAst)({
                ...statusInput,
                ast: statusAst,
            })
            : (0, can_update_sequence_props_1.computeSequencePropsStatusFromContent)({
                ...statusInput,
                fileContents: output,
            });
        return {
            fileName: target.fileName,
            nodePath: target.nodePath,
            props: newStatus.props,
        };
    });
    const firstResult = results[0];
    if (!firstResult) {
        throw new Error('Could not compute sequence prop edit status');
    }
    return {
        canUpdate: true,
        props: firstResult.props,
        results,
    };
});
exports.saveSequencePropsHandler = saveSequencePropsHandler;
