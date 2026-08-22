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
import Parser from 'rss-parser';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const TWEET_TOPIC = process.env.TWEET_TOPIC?.trim() || null;
const EXACT_TWEET_TEXT = process.env.EXACT_TWEET_TEXT?.trim() || null;
const TWEET_COUNT = parseInt(process.env.TWEET_COUNT || '3', 10);
const TWEET_FILE = path.join(process.cwd(), 'data', 'tweet.json');
const TWEET_HISTORY = path.join(process.cwd(), 'data', 'tweet_history.json');

// ── Broad multi-topic RSS feeds (independent of Cohort Zero) ──
const PERSONAL_FEEDS = [
    // Tech & Startups
    'https://techcrunch.com/category/startups/feed/',
    'https://news.ycombinator.com/rss',
    'https://www.technologyreview.com/feed/',
    'https://arstechnica.com/feed/',
    // Finance & Money
    'https://feeds.bloomberg.com/markets/news.rss',
    'https://www.investopedia.com/feedbuilder/feed/getfeed?feedName=rss_headline',
    // Health & Science
    'https://www.sciencedaily.com/rss/health_medicine.xml',
    'https://www.nature.com/nature.rss',
    'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml',
    // World & Politics
    'https://feeds.reuters.com/reuters/topNews',
    'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    // Books & Ideas
    'https://fs.blog/feed/',
    'https://jamesclear.com/feed',
    // Pakistan
    'https://propakistani.pk/category/technology/feed/',
    'https://tribune.com.pk/technology/feed',
];

const parser = new Parser();

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

async function formatExactText(rawText) {
    console.log(`  Intelligently formatting custom text via AI...`);
    const prompt = `You are an intelligent formatting assistant for visual social media cards.
The user has provided a raw block of text. Your ONLY job is to logically structure it.
- Extract the most high-impact hook, title, or main idea from the text to serve as the "heading".
- Format the rest of the text as the "body", adding line breaks (\\n) to break up dense paragraphs.
- Do NOT rewrite or change the underlying meaning.

RAW TEXT:
"${rawText}"

Output valid JSON exactly like this:
{
  "heading": "The extracted high-impact heading",
  "body": "The rest of the intelligently formatted text with \\n newlines"
}`;

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
                    "content": "You output valid JSON. You are a precise formatter."
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
    return parsed.heading ? { heading: parsed.heading, body: parsed.body } : rawText;
}

async function run() {
    console.log("╔══════════════════════════════════════════╗");
    console.log("║   X TWEET ENGINE — @Syedhassankhan_      ║");
    console.log("╚══════════════════════════════════════════╝");

    let topic = TWEET_TOPIC;
    let context = "";
    let result;

    if (EXACT_TWEET_TEXT) {
        // ── Direct Framing Mode: Format exact text with AI ──
        console.log(`\n  Mode: EXACT TEXT (Intelligent Formatting)`);
        console.log(`  Raw Text: "${EXACT_TWEET_TEXT.substring(0, 50)}..."`);
        
        const formatted = await formatExactText(EXACT_TWEET_TEXT);
        
        topic = "Custom Input";
        result = {
            topic: topic,
            tweets: [formatted]
        };
    } else {
        if (topic) {
            // ── Manual mode: user gave a topic ──
            console.log(`\n  Mode: MANUAL TOPIC`);
            console.log(`  Topic: "${topic}"`);
            context = await fetchContext(topic, false);
        } else {
            // ── Auto mode: fetch from personal RSS feeds ──
            console.log(`\n  Mode: AUTO (from RSS feeds)`);
            
            let history = [];
            if (fs.existsSync(TWEET_HISTORY)) {
                history = JSON.parse(fs.readFileSync(TWEET_HISTORY, 'utf-8'));
            }

            let selectedItem = null;
            // Shuffle feeds for variety
            const shuffledFeeds = PERSONAL_FEEDS.sort(() => 0.5 - Math.random());

            for (const feedUrl of shuffledFeeds) {
                try {
                    const feed = await parser.parseURL(feedUrl);
                    for (const item of feed.items) {
                        if (!history.includes(item.link)) {
                            selectedItem = item;
                            break;
                        }
                    }
                } catch (e) {
                    console.log(`  [Skip] Failed to fetch feed ${feedUrl}: ${e.message}`);
                }
                if (selectedItem) break;
            }

            if (selectedItem) {
                topic = selectedItem.title;
                console.log(`  Auto-picked topic: "${topic}"`);
                console.log(`  Source: ${selectedItem.link}`);
                
                // Add to history and keep last 200
                history.push(selectedItem.link);
                if (history.length > 200) history.shift();
                fs.writeFileSync(TWEET_HISTORY, JSON.stringify(history, null, 2));

                // Fetch deep context using Jina AI on the URL
                context = await fetchContext(selectedItem.link, true);
            } else {
                topic = "The reality of building startups in 2026";
                console.log(`  No fresh news found, using default topic: "${topic}"`);
                context = await fetchContext(topic, false);
            }
        }

        result = await generateTweets(topic, context);
    }

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
