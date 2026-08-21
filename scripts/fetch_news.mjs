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
- We are generating a single-page graphic for Instagram to drive community engagement, networking, and discussion among small founders.
- You must write a HOOK that grabs attention in under 1 second.
- You must write a COMMUNITY ENGAGEMENT block (approx 50-80 words). Instead of just explaining the news, use it to start a conversation. Ask a question to the founders, encourage networking, or discuss a shared struggle. The goal is to make people comment, connect, and feel part of a community of builders.
- Provide a cinematic image prompt for the background. NO TEXT IN THE IMAGE.
- Keep the tone welcoming, collaborative, and networking-focused, but still premium.

Output ONLY a JSON object with this exact structure:
{
  "selected_news_title": "${topicOrTitle}",
  "hook": "The one-sentence scroll-stopping hook.",
  "content_rich_summary": "The community-focused discussion text, ending with a question for the founders.",
  "image_prompt": "dark oak boardroom table with financial term sheets, cinematic 4k"
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
