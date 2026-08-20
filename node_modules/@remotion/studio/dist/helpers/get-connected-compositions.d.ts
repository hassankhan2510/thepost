export declare const getConnectedCompositions: <Composition extends {
    readonly componentFromProps?: unknown;
}>({ compositions, singleChildComponent, }: {
    readonly compositions: readonly Composition[];
    readonly singleChildComponent: unknown;
}) => Composition[];
