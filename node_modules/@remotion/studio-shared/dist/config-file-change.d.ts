export type ConfigFileChangeType = 'runtime' | 'reload' | 'restart';
export declare const getConfigFileChangeMessage: (changeType: ConfigFileChangeType) => string;
