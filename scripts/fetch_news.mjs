import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const HISTORY_FILE = path.join(process.cwd(), 'data', 'history.json');
const SCRIPT_FILE = path.join(process.cwd(), 'data', 'script.json');

const parser = new Parser();

const RSS_FEEDS = [
    'https://techcrunch.com/category/startups/feed/',
    'https://propakistani.pk/category/technology/feed/',
    'https://tribune.com.pk/technology/feed',
    'https://news.ycombinator.com/rss',
    'https://www.techjuice.pk/feed/',
    'https://pakwired.com/feed/'
];

async function loadHistory() {
    if (fs.existsSync(HISTORY_FILE)) {
        return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    }
    return [];
}

async function saveHistory(history) {
    if (!fs.existsSync(path.dirname(HISTORY_FILE))) {
        fs.mkdirSync(path.dirname(HISTORY_FILE), { recursive: true });
    }
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

async function fetchAllNews() {
    let allNews = [];
    for (const url of RSS_FEEDS) {
        try {
            console.log(`Fetching ${url}...`);
            const feed = await parser.parseURL(url);
            feed.items.forEach(item => {
                allNews.push({
                    title: item.title,
                    link: item.link,
                    pubDate: item.pubDate,
                    source: feed.title
                });
            });
        } catch (error) {
            console.error(`Failed to fetch ${url}:`, error.message);
        }
    }
    allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    return allNews;
}

// 1. Ask LLM to pick the best headline
async function pickBestHeadline(newsItems) {
    console.log("Picking the best headline...");
    const prompt = `
You are a sharp, insider tech editor. Review these headlines and pick EXACTLY ONE that is the most interesting and high-impact for a founder/startup audience. Output ONLY the index number of the chosen headline.

Headlines:
${newsItems.map((n, i) => `${i}. [${n.source}] ${n.title}`).join('\n')}
`;
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": "openrouter/free",
            "messages": [{ "role": "user", "content": prompt }]
        })
    });
    if (!response.ok) throw new Error(`OpenRouter API Error: ${await response.text()}`);
    const data = await response.json();
    const text = data.choices[0].message.content.trim();
    const match = text.match(/\d+/);
    const index = match ? parseInt(match[0], 10) : 0;
    return newsItems[Math.min(index, newsItems.length - 1)];
}

// 2. Fetch context via Jina AI
async function fetchJinaContext(query, isUrl = false) {
    const baseUrl = isUrl ? `https://r.jina.ai/${query}` : `https://s.jina.ai/${encodeURIComponent(query)}`;
    console.log(`Fetching deep context via Jina AI: ${baseUrl}`);
    try {
        const response = await fetch(baseUrl, {
            headers: { 'Accept': 'text/plain' }
        });
        if (!response.ok) return "";
        let text = await response.text();
        // truncate to 8000 chars to avoid overwhelming the free LLM context window
        return text.slice(0, 8000);
    } catch (e) {
        console.error("Jina AI fetch failed:", e.message);
        return "";
    }
}

// 3. Generate script and thread from deep context
async function generateContent(contextMarkdown, topicOrTitle) {
    console.log("Generating final script and thread...");
    const prompt = `
You are a top 1% sharp, insider content creator for "Cohort Zero" — an elite media brand about startups, venture capital, and the mechanics of how companies actually win or collapse. The audience is veteran founders, technical operators, and investors who want high-signal substance, not entry-level motivation.

Below is the deep context (facts, quotes, metrics) for the topic: "${topicOrTitle}".

DEEP CONTEXT:
${contextMarkdown}

RULES:
- Use the deep context above to write 4-5 punchy "script_lines" that break down WHY this news/topic matters for founders. Each line is a separate screen in an Instagram reel. Think: hook → context → insight → takeaway.
- Include specific numbers, metrics, or quotes from the context if relevant. No generic platitudes.
- The FIRST script_line is the hook. It must grab attention in under 1 second with a bold claim or surprising angle.
- Write a LinkedIn/Instagram caption (2-3 sentences max). Be deeply analytical and contrarian. Think Bloomberg crossed with a highly technical VC memo.
- Hashtags: 5-8 relevant tags.
- image_prompt: a REALISTIC, highly cinematic corporate/business/startup scene. Examples: "dimly lit venture capital boardroom, dark oak table, term sheets, cinematic 4k". NEVER sci-fi, neon, futuristic, abstract, or fantasy. The brand is dark, clean, corporate, high-status.
- twitter_thread: An array of 3-5 tweets (strings) breaking down this topic mechanically.

Output valid JSON:
{
  "selected_news_title": "${topicOrTitle}",
  "hook": "the one-sentence hook for the reel",
  "caption": "LinkedIn/Instagram caption.",
  "hashtags": ["#startup", "#founder"],
  "script_lines": ["Hook line", "Context line", "Insight line", "Takeaway line"],
  "image_prompt": "realistic corporate/startup scene, dark lighting, cinematic 4k, no text no logos",
  "twitter_thread": ["Tweet 1", "Tweet 2", "Tweet 3"]
}
`;

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
                { "role": "system", "content": "You output valid JSON. You are analytical and sharp, never motivational." },
                { "role": "user", "content": prompt }
            ]
        })
    });

    if (!response.ok) throw new Error(`OpenRouter API Error: ${await response.text()}`);

    const data = await response.json();
    let text = data.choices[0].message.content;
    text = text.replace(/^\s*```(json)?\n?/, '').replace(/```\s*$/, '');
    const parsed = JSON.parse(text);

    if (!parsed.selected_news_titles) {
        parsed.selected_news_titles = [parsed.selected_news_title || ""];
    }

    return parsed;
}

async function run() {
    const customTopic = process.env.CUSTOM_TOPIC?.trim() || null;
    let history = [];
    let generated;
    let titleToSave = "";
    
    if (customTopic) {
        console.log(`Using custom topic: "${customTopic}"`);
        const context = await fetchJinaContext(customTopic, false);
        generated = await generateContent(context, customTopic);
        titleToSave = customTopic;
    } else {
        history = await loadHistory();
        const rawNews = await fetchAllNews();
        const newItems = rawNews.filter(n => !history.includes(n.title));
        console.log(`Found ${newItems.length} new articles.`);

        if (newItems.length === 0) {
            console.log("No new articles found. Exiting.");
            return;
        }
        
        const topItems = newItems.slice(0, 20);
        const bestStory = await pickBestHeadline(topItems);
        console.log(`Selected Best Story: ${bestStory.title}`);
        
        const context = await fetchJinaContext(bestStory.link, true);
        generated = await generateContent(context, bestStory.title);
        titleToSave = bestStory.title;
        
        history.push(titleToSave);
        await saveHistory(history);
    }

    try {
        console.log("Content generated successfully!");
        console.log("Hook:", generated.hook);

        if (!fs.existsSync(path.dirname(SCRIPT_FILE))) fs.mkdirSync(path.dirname(SCRIPT_FILE), { recursive: true });
        
        // Save script
        fs.writeFileSync(SCRIPT_FILE, JSON.stringify(generated, null, 2));
        console.log(`Saved generated script to ${SCRIPT_FILE}`);
        
        // Save thread
        const threadFile = path.join(process.cwd(), 'data', 'thread.json');
        fs.writeFileSync(threadFile, JSON.stringify(generated.twitter_thread || [], null, 2));
        console.log(`Saved twitter thread to ${threadFile}`);
        
    } catch (err) {
        console.error("Failed during save:", err.message);
    }
}

run();
