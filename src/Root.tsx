import React from 'react';
import { Composition, staticFile } from 'remotion';
import { Reel } from './Reel';
import { Carousel } from './Carousel';

// Default fallback data — overridden by --props at render time
const DEFAULT_SCRIPT = {
    caption: "Cohort Zero — Founders' Files",
    script_lines: [
        "Welcome to Cohort Zero.",
        "The founders' files.",
        "Real strategy. Real mechanics.",
        "No guru fluff.",
    ],
    selected_news_titles: ["Default"],
    image_prompt: "",
};

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="Reel"
                component={Reel}
                durationInFrames={300}
                fps={30}
                width={1080}
                height={1920}
                defaultProps={{
                    scriptData: DEFAULT_SCRIPT,
                }}
            />
            <Composition
                id="Post"
                component={Reel}
                durationInFrames={300}
                fps={30}
                width={1080}
                height={1080}
                defaultProps={{
                    scriptData: DEFAULT_SCRIPT,
                }}
            />
            <Composition
                id="Carousel"
                component={Carousel}
                durationInFrames={20}
                fps={30}
                width={1080}
                height={1350}
                defaultProps={{
                    scriptData: DEFAULT_SCRIPT,
                }}
            />
        </>
    );
};
