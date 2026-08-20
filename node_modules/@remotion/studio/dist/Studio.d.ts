import React from 'react';
declare global {
    interface Window {
        remotion_experimentalKeepAudioContextAlive: boolean | undefined;
    }
}
export declare const Studio: React.FC<{
    readonly rootComponent: React.FC;
    readonly readOnly: boolean;
}>;
