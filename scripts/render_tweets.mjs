/**
 * render_tweets.mjs — Renders tweet images via Remotion still.
 *
 * Reads data/tweet.json, loops over each tweet, builds props, and
 * calls `npx remotion still` to produce out/tweets/tweet_0.png, tweet_1.png, etc.
 *
 * Usage:
 *   node scripts/render_tweets.mjs
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TWEET_FILE = path.join(process.cwd(), 'data', 'tweet.json');
const OUT_DIR = path.join(process.cwd(), 'out', 'tweets');
const TEMP_PROPS = path.join(process.cwd(), 'data', 'tweet_props.json');

function run() {
    if (!fs.existsSync(TWEET_FILE)) {
        console.error("No data/tweet.json found. Run 'npm run tweet' first.");
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(TWEET_FILE, 'utf-8'));
    const tweets = data.tweets || [];

    if (tweets.length === 0) {
        console.log("No tweets to render.");
        return;
    }

    // Ensure output dir
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

    console.log(`Rendering ${tweets.length} tweet images...`);

    for (let i = 0; i < tweets.length; i++) {
        const tweetText = tweets[i];

        // Build props for this tweet
        const props = {
            tweetData: {
                displayName: data.displayName || "Hassan Khan",
                username: data.username || "@Syedhassankhan_",
                tweet: tweetText,
                avatarFile: data.avatarFile || "avatar.jpg",
                verified: data.verified !== false,
            }
        };

        // Write temp props file
        fs.writeFileSync(TEMP_PROPS, JSON.stringify(props, null, 2));

        const outFile = path.join(OUT_DIR, `tweet_${i}.png`);
        console.log(`  [${i + 1}/${tweets.length}] Rendering: ${tweetText.slice(0, 60)}...`);

        try {
            execSync(
                `npx remotion still src/index.ts TweetCard "${outFile}" --props=data/tweet_props.json`,
                { stdio: 'inherit' }
            );
            console.log(`  ✓ Saved to ${outFile}`);
        } catch (err) {
            console.error(`  ✗ Failed to render tweet ${i}:`, err.message);
        }
    }

    // Clean up temp props
    try { fs.rmSync(TEMP_PROPS, { force: true }); } catch {}

    console.log(`\nDone! ${tweets.length} tweet images in ${OUT_DIR}`);
}

run();
