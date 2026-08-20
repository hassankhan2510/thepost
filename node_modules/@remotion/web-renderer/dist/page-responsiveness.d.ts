export type WebRendererPageResponsiveness = 'disabled' | 'low' | 'medium' | 'high' | number;
export declare const resolvePageResponsivenessInterval: (pageResponsiveness: unknown) => number | null;
export declare const createPageResponsivenessController: ({ intervalInMilliseconds, now, wait, }: {
    intervalInMilliseconds: number | null;
    now: () => number;
    wait: () => Promise<void>;
}) => {
    waitIfNeeded: () => Promise<void>;
};
