type State = {
    editorSnapping: boolean;
    setEditorSnapping: (cb: (prevState: boolean) => boolean) => void;
};
export declare const persistEditorSnappingOption: (option: boolean) => void;
export declare const loadEditorSnappingOption: () => boolean;
export declare const EditorSnappingContext: import("react").Context<State>;
export {};
