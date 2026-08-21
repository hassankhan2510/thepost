import React from 'react';
import { Composition, staticFile } from 'remotion';
import { Reel } from './Reel';
import { Carousel } from './Carousel';
import { TweetCard } from './TweetCard';
import { CohortZeroCard } from './CohortZeroCard';

// Default fallback data — overridden by --props at render time
const DEFAULT_SCRIPT = {
    hook: "The reality of building startups in 2026.",
    content_rich_summary: "It takes more than a good idea to build a unicorn. You need mechanics, execution, and an unbreakable filter for bad ideas. Most founders fail because they optimize for funding instead of product-market fit.",
    selected_news_title: "Default News Title",
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
            <Composition
                id="CohortZeroCard"
                component={CohortZeroCard}
                durationInFrames={1}
                fps={30}
                width={1080}
                height={1920}
                defaultProps={{
                    scriptData: DEFAULT_SCRIPT,
                }}
            />
        </>
    );
};
