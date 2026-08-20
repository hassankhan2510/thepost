import React, { useEffect, useState } from 'react';
import { Composition, continueRender, delayRender, staticFile, getInputProps } from 'remotion';
import { Reel } from './Reel';

export const RemotionRoot: React.FC = () => {
    const [handle] = useState(() => delayRender());
    const inputProps = getInputProps();
    const [scriptData, setScriptData] = useState<any>(inputProps && Object.keys(inputProps).length > 0 ? inputProps : null);

    useEffect(() => {
        if (scriptData) {
            continueRender(handle);
            return;
        }

        fetch(staticFile('script.json'))
            .then((res) => res.json())
            .then((data) => {
                setScriptData(data);
                continueRender(handle);
            })
            .catch((err) => {
                console.error("Failed to load script.json:", err);
                setScriptData({
                    caption: "Default Caption",
                    script_lines: ["Welcome to Cohort Zero"],
                    selected_news_titles: ["News"]
                });
                continueRender(handle);
            });
    }, [handle, scriptData]);

    return (
        <>
            <Composition
                id="Reel"
                component={Reel}
                durationInFrames={300} // 10 seconds @ 30fps
                fps={30}
                width={1080}
                height={1920}
                defaultProps={{
                    scriptData
                }}
            />
            <Composition
                id="Post"
                component={Reel} // Re-using Reel with square dimensions
                durationInFrames={300}
                fps={30}
                width={1080}
                height={1080}
                defaultProps={{
                    scriptData
                }}
            />
        </>
    );
};
