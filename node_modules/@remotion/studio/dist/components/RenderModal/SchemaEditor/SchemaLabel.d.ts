import React from 'react';
import type { JSONPath } from './zod-types';
export declare const SchemaDescriptionOverrideContext: React.Context<{
    readonly jsonPath: JSONPath;
    readonly description: string;
} | null>;
export declare const SchemaLabel: React.FC<{
    readonly jsonPath: JSONPath;
    readonly onRemove: null | (() => void);
    readonly valid: boolean;
    readonly suffix: string | null;
    readonly handleClick: null | (() => void);
    readonly description: string | null;
}>;
