import React, { useEffect, useState } from 'react';
import { Composition, continueRender, delayRender } from 'remotion';
import { Reel } from './Reel';

// Try to load script data
const fetchScriptData = async () => {
    try {
        const response = await fetch('/data/script.json');
        return await response.json();
    } catch (e) {
        return null;
    }
};

export const RemotionRoot: React.FC = () => {
    const [handle] = useState(() => delayRender());
    const [scriptData, setScriptData] = useState<any>(null);

    useEffect(() => {
        fetchScriptData().then(data => {
            setScriptData(data || {
                caption: "Sample Caption",
                script_lines: ["Line 1", "Line 2"],
                selected_news_titles: ["Sample News"]
            });
            continueRender(handle);
        });
    }, [handle]);

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
                component={Reel} // Re-using Reel but with different dimensions
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
