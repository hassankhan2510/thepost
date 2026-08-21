/**
 * generate_tweet.mjs — Elite tweet content engine for X (@Syedhassankhan_)
 *
 * Two modes:
 *   1) TWEET_TOPIC="compound interest"  → generates a top 0.01% tweet on that topic
 *   2) No TWEET_TOPIC                   → picks from expanded RSS feeds (auto mode)
 *
 * Writes data/tweet.json with an array of tweet objects.
 * Each tweet is designed to be screenshot-worthy: specific, contrarian, data-backed.
 *
 * Usage:
 *   TWEET_TOPIC="why most founders fail" node scripts/generate_tweet.mjs
 *   node scripts/generate_tweet.mjs   # auto-mode from RSS
 */
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const TWEET_TOPIC = process.env.TWEET_TOPIC?.trim() || null;
const TWEET_COUNT = parseInt(process.env.TWEET_COUNT || '3', 10);
const SCRIPT_FILE = path.join(process.cwd(), 'data', 'script.json');
const TWEET_FILE = path.join(process.cwd(), 'data', 'tweet.json');

// ── Jina AI for deep context on any topic ──
async function fetchContext(query, isUrl = false) {
    const baseUrl = isUrl
        ? `https://r.jina.ai/${query}`
        : `https://s.jina.ai/${encodeURIComponent(query)}`;
    console.log(`  Fetching deep context: ${baseUrl}`);
    try {
        const response = await fetch(baseUrl, {
            headers: { 'Accept': 'text/plain' }
        });
        if (!response.ok) return "";
        let text = await response.text();
        return text.slice(0, 8000);
    } catch (e) {
        console.error("  Jina fetch failed:", e.message);
        return "";
    }
}

// ── The 0.01% Tweet Prompt ──
function buildPrompt(topic, context) {
    return `You are the ghost-writer behind the most viral, high-signal X/Twitter accounts on Earth.
Your tweets get 10M+ impressions because they are SPECIFIC, CONTRARIAN, and IMPOSSIBLE TO SCROLL PAST.

TOPIC: "${topic}"

DEEP CONTEXT (use real facts/numbers from this):
${context || "(No context available — use your knowledge but keep claims specific and verifiable.)"}

Generate exactly ${TWEET_COUNT} standalone tweets. Each tweet MUST:

1. THE SCREENSHOT TEST: Would someone screenshot this and send it to 3 friends? If not, rewrite.
2. SPECIFICITY OVER GENERALITY: "Compound interest at 8% turns $500/mo into $1.5M in 30 years" beats "Start investing early."
3. PATTERN INTERRUPT: The first line must make someone stop scrolling. Use a counterintuitive claim, a shocking number, or a "wait, what?" angle.
4. NO GENERIC MOTIVATION: Delete any sentence that sounds like it could be on a motivational poster. No "believe in yourself", no "consistency is key", no "work hard."
5. TEACH ONE THING: Every tweet should leave the reader knowing something they didn't know 10 seconds ago.
6. CONVERSATIONAL AUTHORITY: Write like a smart friend explaining something over coffee, not like a LinkedIn influencer. Short sentences. No emojis. No hashtags.
7. CONTRARIAN ANGLE: Challenge a commonly held belief with evidence. "Everyone says X. The data shows Y."
8. THE REPLY MAGNET: End with an insight so sharp people HAVE to respond — either to agree loudly or push back. Don't ask a question. State something bold.
9. LENGTH: Each tweet must be 180-280 characters. Tight, punchy, no filler.
10. REAL NUMBERS: If the context has specific data (percentages, dollar amounts, dates, studies), USE THEM. Vague claims die on X.

BANNED PATTERNS (auto-reject if any of these appear):
- "Here's the thing"
- "Let that sink in"  
- "Read that again"
- "Most people don't realize"
- "Unpopular opinion"
- "Thread 🧵" 
- Any emoji
- Any hashtag
- "Game changer"
- "This is huge"
- Starting with "I" 

Output valid JSON:
{
  "topic": "${topic}",
  "tweets": [
    "First tweet text here",
    "Second tweet text here",
    "Third tweet text here"
  ]
}`;
}

async function generateTweets(topic, context) {
    console.log(`  Generating ${TWEET_COUNT} elite tweets on: "${topic}"`);

    const prompt = buildPrompt(topic, context);

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": "openrouter/free",
            "response_format": { "type": "json_object" },
            "messages": [
                {
                    "role": "system",
                    "content": "You output valid JSON. You are the sharpest writer on X. Zero fluff. Every word earns its place."
                },
                { "role": "user", "content": prompt }
            ]
        })
    });

    if (!response.ok) throw new Error(`OpenRouter API Error: ${await response.text()}`);

    const data = await response.json();
    let text = data.choices[0].message.content;
    text = text.replace(/^\s*```(json)?\n?/, '').replace(/```\s*$/, '');

    const parsed = JSON.parse(text);
    return parsed;
}

async function run() {
    console.log("╔══════════════════════════════════════════╗");
    console.log("║   X TWEET ENGINE — @Syedhassankhan_      ║");
    console.log("╚══════════════════════════════════════════╝");

    let topic = TWEET_TOPIC;
    let context = "";

    if (topic) {
        // ── Manual mode: user gave a topic ──
        console.log(`\n  Mode: MANUAL TOPIC`);
        console.log(`  Topic: "${topic}"`);
        context = await fetchContext(topic, false);
    } else {
        // ── Auto mode: use the script.json topic if available ──
        console.log(`\n  Mode: AUTO (from script.json)`);
        if (fs.existsSync(SCRIPT_FILE)) {
            const script = JSON.parse(fs.readFileSync(SCRIPT_FILE, 'utf-8'));
            topic = script.selected_news_title || script.selected_news_titles?.[0] || "technology and startups";
            console.log(`  Auto-picked topic: "${topic}"`);
            // Use existing twitter_thread if available, else generate fresh
            if (script.twitter_thread && script.twitter_thread.length > 0 &&
                script.twitter_thread[0] !== "Tweet 1") {
                console.log(`  Found existing thread in script.json (${script.twitter_thread.length} tweets)`);
                // Still regenerate with elite quality — the fetch_news thread is basic
            }
            context = await fetchContext(topic, false);
        } else {
            topic = "building startups in 2026";
            console.log(`  No script.json found, using default topic: "${topic}"`);
            context = await fetchContext(topic, false);
        }
    }

    const result = await generateTweets(topic, context);

    // Build the tweet data with full metadata for the renderer
    const tweetData = {
        topic: result.topic || topic,
        displayName: "Hassan Khan",
        username: "@Syedhassankhan_",
        avatarFile: "avatar.jpg",
        verified: true,
        tweets: result.tweets || [],
        generatedAt: new Date().toISOString(),
    };

    // Ensure data dir exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    fs.writeFileSync(TWEET_FILE, JSON.stringify(tweetData, null, 2));
    console.log(`\n  ✓ Saved ${tweetData.tweets.length} tweets to ${TWEET_FILE}`);
    
    // Print preview
    tweetData.tweets.forEach((t, i) => {
        console.log(`\n  ── Tweet ${i + 1} (${t.length} chars) ──`);
        console.log(`  ${t}`);
    });

    console.log(`\n  Done. Run "npm run render:tweets" to generate images.`);
}

run().catch(err => {
    console.error("Tweet generation failed:", err.message);
    process.exit(1);
});
