"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.unsubscribeClientSequencePropsWatchers = exports.unsubscribeFromSequencePropsWatchers = exports.subscribeToSequencePropsWatchers = void 0;
const node_path_1 = __importDefault(require("node:path"));
const renderer_1 = require("@remotion/renderer");
const studio_shared_1 = require("@remotion/studio-shared");
const file_watcher_1 = require("../file-watcher");
const jsx_component_identity_1 = require("./jsx-component-identity");
const jsx_element_not_found_at_location_error_1 = require("./jsx-element-not-found-at-location-error");
const live_events_1 = require("./live-events");
const node_path_cache_1 = require("./node-path-cache");
const can_update_sequence_props_1 = require("./routes/can-update-sequence-props");
const sequencePropsWatchers = {};
const getWatcherKey = (nodePath, assetKeys) => `${(0, studio_shared_1.stringifySequenceSubscriptionKey)(nodePath)}:${assetKeys.join('\0')}:${JSON.stringify(nodePath.videoConfigValues)}`;
const getSequencePropsStatus = ({ fileName, line, column, preferredNodePath, resolvedNodePath, componentIdentity, keys, assetKeys, effects, remotionRoot, logLevel, videoConfigValues, }) => {
    if (preferredNodePath) {
        try {
            const fromNodePath = (0, can_update_sequence_props_1.computeSequencePropsStatus)({
                fileName,
                nodePath: preferredNodePath,
                componentIdentity,
                keys,
                assetKeys,
                effects,
                remotionRoot,
                videoConfigValues,
            });
            return {
                status: fromNodePath,
                nodePath: {
                    absolutePath: node_path_1.default.resolve(remotionRoot, fileName),
                    nodePath: preferredNodePath,
                    sequenceKeys: keys,
                    effectKeys: effects,
                    videoConfigValues,
                },
                success: true,
            };
        }
        catch (error) {
            if (!(error instanceof jsx_component_identity_1.JsxElementIdentityMismatchError ||
                error instanceof jsx_element_not_found_at_location_error_1.JsxElementNotFoundAtLocationError)) {
                throw error;
            }
        }
    }
    // Try cached nodePath first (handles stale source maps after suppressed rebuilds)
    const cachedNodePath = (0, node_path_cache_1.getCachedNodePath)(fileName, line, column);
    if (cachedNodePath) {
        const cachedResult = (() => {
            try {
                return (0, can_update_sequence_props_1.computeSequencePropsStatus)({
                    fileName,
                    nodePath: cachedNodePath,
                    componentIdentity,
                    keys,
                    assetKeys,
                    effects,
                    remotionRoot,
                    videoConfigValues,
                });
            }
            catch (error) {
                if (error instanceof jsx_component_identity_1.JsxElementIdentityMismatchError ||
                    error instanceof jsx_element_not_found_at_location_error_1.JsxElementNotFoundAtLocationError) {
                    return null;
                }
                throw error;
            }
        })();
        if (cachedResult === null || cachedResult === void 0 ? void 0 : cachedResult.canUpdate) {
            return {
                status: cachedResult,
                nodePath: {
                    absolutePath: node_path_1.default.resolve(remotionRoot, fileName),
                    nodePath: cachedNodePath,
                    sequenceKeys: keys,
                    effectKeys: effects,
                    videoConfigValues,
                },
                success: true,
            };
        }
    }
    if (resolvedNodePath) {
        try {
            return {
                status: (0, can_update_sequence_props_1.computeSequencePropsStatus)({
                    fileName,
                    nodePath: resolvedNodePath,
                    componentIdentity,
                    keys,
                    assetKeys,
                    effects,
                    remotionRoot,
                    videoConfigValues,
                }),
                nodePath: {
                    absolutePath: node_path_1.default.resolve(remotionRoot, fileName),
                    nodePath: resolvedNodePath,
                    sequenceKeys: keys,
                    effectKeys: effects,
                    videoConfigValues,
                },
                success: true,
            };
        }
        catch (error) {
            if (!(error instanceof jsx_component_identity_1.JsxElementIdentityMismatchError ||
                error instanceof jsx_element_not_found_at_location_error_1.JsxElementNotFoundAtLocationError)) {
                throw error;
            }
        }
    }
    const status = (0, can_update_sequence_props_1.computeSequencePropsStatusFromFilenameByLocation)({
        fileName,
        line,
        column,
        componentIdentity,
        keys,
        assetKeys,
        effects,
        remotionRoot,
        logLevel,
        videoConfigValues,
    });
    return status;
};
const subscribeToSequencePropsWatchers = ({ fileName, line, column, nodePath: preferredNodePath, resolvedNodePath = null, componentIdentity, keys, assetKeys, effects, remotionRoot, clientId, logLevel, videoConfigValues, }) => {
    var _a;
    const initialResult = getSequencePropsStatus({
        fileName,
        line,
        column,
        preferredNodePath,
        resolvedNodePath,
        componentIdentity,
        keys,
        assetKeys,
        effects,
        remotionRoot,
        logLevel,
        videoConfigValues,
    });
    if (!initialResult.success) {
        return initialResult;
    }
    const absolutePath = node_path_1.default.resolve(remotionRoot, fileName);
    // Cache the resolved nodePath for future lookups with stale source maps
    (0, node_path_cache_1.setCachedNodePath)(fileName, line, column, initialResult.nodePath.nodePath);
    const { nodePath } = initialResult;
    const watcherKey = getWatcherKey(nodePath, assetKeys);
    const existingWatcher = (_a = sequencePropsWatchers[clientId]) === null || _a === void 0 ? void 0 : _a[watcherKey];
    if (existingWatcher) {
        existingWatcher.refCount++;
        return initialResult;
    }
    const watcherInfo = {
        unwatch: () => undefined,
        refCount: 1,
        currentNodePath: nodePath,
    };
    const { unwatch } = (0, file_watcher_1.installFileWatcher)({
        file: absolutePath,
        existenceOnly: false,
        onChange: (event) => {
            if (event.type === 'deleted') {
                return;
            }
            if (event.originatorClientId === clientId) {
                return;
            }
            if (event.type === 'changed' && event.skipSequencePropsUpdate) {
                return;
            }
            try {
                const result = (0, can_update_sequence_props_1.computeSequencePropsStatusFromContent)({
                    fileContents: event.content,
                    nodePath: watcherInfo.currentNodePath.nodePath,
                    componentIdentity,
                    keys,
                    assetKeys,
                    effects,
                    videoConfigValues,
                });
                const previousEffectChain = result.effects.map((effect) => effect.canUpdate && effect.callee);
                const newEffectChain = initialResult.success &&
                    initialResult.status.effects.map((effect) => effect.canUpdate && effect.callee);
                if (previousEffectChain.join(',') !== newEffectChain.join(',')) {
                    renderer_1.RenderInternals.Log.verbose({ indent: false, logLevel }, 'Effect chain changed, not sending "sequence-props-updated" event');
                    return;
                }
                (0, live_events_1.waitForLiveEventsListener)().then((listener) => {
                    listener.sendEventToClientId(clientId, {
                        type: 'sequence-props-updated',
                        fileName,
                        nodePath: watcherInfo.currentNodePath,
                        result,
                    });
                });
            }
            catch (error) {
                if (error instanceof jsx_element_not_found_at_location_error_1.JsxElementNotFoundAtLocationError ||
                    error instanceof jsx_component_identity_1.JsxElementIdentityMismatchError) {
                    (0, live_events_1.waitForLiveEventsListener)().then((listener) => {
                        listener.sendEventToClientId(clientId, {
                            type: 'lost-node-path',
                            fileName,
                            line,
                            column,
                        });
                    });
                    return;
                }
                renderer_1.RenderInternals.Log.error({ indent: false, logLevel }, error);
            }
        },
    });
    watcherInfo.unwatch = unwatch;
    if (!sequencePropsWatchers[clientId]) {
        sequencePropsWatchers[clientId] = {};
    }
    sequencePropsWatchers[clientId][watcherKey] = watcherInfo;
    return initialResult;
};
exports.subscribeToSequencePropsWatchers = subscribeToSequencePropsWatchers;
const unsubscribeFromSequencePropsWatchers = ({ fileName, nodePath, remotionRoot, clientId, sequenceKeys, assetKeys, effectKeys, videoConfigValues, }) => {
    const absolutePath = node_path_1.default.resolve(remotionRoot, fileName);
    const watcherKey = getWatcherKey({
        absolutePath,
        nodePath,
        sequenceKeys,
        effectKeys,
        videoConfigValues,
    }, assetKeys);
    if (!sequencePropsWatchers[clientId] ||
        !sequencePropsWatchers[clientId][watcherKey]) {
        return;
    }
    sequencePropsWatchers[clientId][watcherKey].refCount--;
    if (sequencePropsWatchers[clientId][watcherKey].refCount <= 0) {
        sequencePropsWatchers[clientId][watcherKey].unwatch();
        delete sequencePropsWatchers[clientId][watcherKey];
    }
};
exports.unsubscribeFromSequencePropsWatchers = unsubscribeFromSequencePropsWatchers;
const unsubscribeClientSequencePropsWatchers = (clientId) => {
    if (!sequencePropsWatchers[clientId]) {
        return;
    }
    Object.values(sequencePropsWatchers[clientId]).forEach((watcher) => {
        watcher.unwatch();
    });
    delete sequencePropsWatchers[clientId];
};
exports.unsubscribeClientSequencePropsWatchers = unsubscribeClientSequencePropsWatchers;
