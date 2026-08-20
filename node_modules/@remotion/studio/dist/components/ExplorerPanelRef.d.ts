export type ExplorerSidebarPanel = 'assets' | 'compositions';
export declare const explorerSidebarTabs: import("react").RefObject<{
    getSelectedPanel: () => ExplorerSidebarPanel;
    selectAssetsPanel: () => void;
    selectCompositionPanel: () => void;
} | null>;
