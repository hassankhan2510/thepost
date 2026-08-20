import React from 'react';
type OptionsSidebarPanel = 'inspector' | 'renders';
export declare const persistSelectedOptionsSidebarPanel: (panel: OptionsSidebarPanel) => void;
export declare const OptionsPanel: React.FC<{
    readonly readOnlyStudio: boolean;
}>;
export {};
