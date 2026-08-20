import React from 'react';
import type { ComboboxValue } from './NewComposition/ComboBox';
type ContextMenuItemsResult = false | readonly ComboboxValue[];
export type ContextMenuItemsFactory = (event: MouseEvent) => ContextMenuItemsResult | Promise<ContextMenuItemsResult>;
export declare const resolveContextMenuItems: (getItems: ContextMenuItemsFactory, event: MouseEvent) => Promise<readonly ComboboxValue[] | null>;
type ContextMenuProps = {
    readonly children: React.ReactNode;
    readonly getItems: ContextMenuItemsFactory;
    readonly style?: React.CSSProperties;
    readonly className?: string;
    readonly onPointerDown?: React.PointerEventHandler<HTMLDivElement>;
};
export declare const ContextMenu: React.ForwardRefExoticComponent<ContextMenuProps & React.RefAttributes<HTMLDivElement>>;
export declare const ContextMenuForTarget: React.FC<{
    readonly triggerRef: React.RefObject<HTMLElement | SVGElement | null>;
    readonly getItems: ContextMenuItemsFactory;
    readonly onOpenChange?: (open: boolean) => void;
}>;
export {};
