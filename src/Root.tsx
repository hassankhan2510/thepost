import React from 'react';
import { Composition, staticFile } from 'remotion';
import { Reel } from './Reel';
import { Carousel } from './Carousel';
import { TweetCard } from './TweetCard';

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

const DEFAULT_TWEET = {
    displayName: "Hassan Khan",
    username: "@Syedhassankhan_",
    tweet: "The best founders don't have better ideas. They have better filters for killing bad ones early.",
    avatarFile: "avatar.jpg",
    verified: true,
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
            <Composition
                id="TweetCard"
                component={TweetCard}
                durationInFrames={1}
                fps={30}
                width={1080}
                height={1080}
                defaultProps={{
                    tweetData: DEFAULT_TWEET,
                }}
            />
        </>
    );
};
