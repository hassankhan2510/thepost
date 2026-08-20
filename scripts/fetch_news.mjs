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

async function generateContent(newsItems) {
    console.log("Calling OpenRouter to generate content...");
    const prompt = `
You are a sharp, insider content creator for "Cohort Zero" — a media brand about startups, venture capital, and the mechanics of how companies actually win or collapse. The audience is founders, operators, and tech people who want substance, not motivation.

RULES:
- Pick EXACTLY ONE headline from the list below. The single most interesting one from a founder/business perspective. Do NOT combine multiple stories.
- Write 4-5 punchy "script_lines" that break down WHY this news matters for founders. Each line is a separate screen in an Instagram reel. Think: hook → context → insight → takeaway.
- The FIRST script_line is the hook. It must grab attention in under 2 seconds. No intros, no greetings, no "Hey founders". Start with the sharpest, most surprising angle.
- Write a LinkedIn/Instagram caption (2-3 sentences max). Be analytical, not motivational. No guru fluff. No "we turn bold ideas into reality" energy. Think Bloomberg, not Tony Robbins.
- Hashtags: 5-8, relevant to the specific news story and the startup ecosystem.
- image_prompt: a REALISTIC, corporate/business/startup scene. Examples: "dimly lit venture capital boardroom, dark oak table, term sheets, cinematic 4k", "close-up of founder hands on laptop in dark office, warm desk lamp, shallow depth of field". NEVER sci-fi, neon, futuristic, abstract, or fantasy. The brand is dark, clean, corporate.

News Headlines:
${newsItems.map((n, i) => `${i + 1}. [${n.source}] ${n.title}`).join('\n')}

Output valid JSON:
{
  "selected_news_title": "the single headline you picked",
  "hook": "the one-sentence hook for the reel (also used as script_lines[0])",
  "caption": "LinkedIn/Instagram caption. Sharp, analytical, 2-3 sentences.",
  "hashtags": ["#startup", "#founder", "#venturecapital"],
  "script_lines": ["Hook line", "Context line", "Insight line", "Takeaway line"],
  "image_prompt": "realistic corporate/startup scene, dark lighting, cinematic 4k, no text no logos"
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

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenRouter API Error: ${err}`);
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    // Normalize: ensure selected_news_titles is always an array for history
    if (!parsed.selected_news_titles) {
        parsed.selected_news_titles = [parsed.selected_news_title || ""];
    }

    return parsed;
}

async function run() {
    const history = await loadHistory();
    const rawNews = await fetchAllNews();
    
    const newItems = rawNews.filter(n => !history.includes(n.title));
    console.log(`Found ${newItems.length} new articles.`);

    if (newItems.length === 0) {
        console.log("No new articles found. Exiting.");
        return;
    }

    const topItems = newItems.slice(0, 20);

    try {
        const generated = await generateContent(topItems);
        console.log("Content generated successfully!");
        console.log("Selected:", generated.selected_news_title || generated.selected_news_titles?.[0]);
        console.log("Hook:", generated.hook);

        // Add selected to history
        const titles = generated.selected_news_titles || [generated.selected_news_title];
        titles.forEach(title => { if (title) history.push(title); });
        await saveHistory(history);

        // Save script
        if (!fs.existsSync(path.dirname(SCRIPT_FILE))) {
            fs.mkdirSync(path.dirname(SCRIPT_FILE), { recursive: true });
        }
        fs.writeFileSync(SCRIPT_FILE, JSON.stringify(generated, null, 2));
        console.log(`Saved generated script to ${SCRIPT_FILE}`);
    } catch (err) {
        console.error("Failed during content generation:", err.message);
    }
}

run();
