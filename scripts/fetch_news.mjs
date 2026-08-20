import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || ''; // Add your key here or via env
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
    // Sort by most recent
    allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
    return allNews;
}

async function generateContent(newsItems) {
    console.log("Calling OpenRouter to generate content...");
    const prompt = `
You are an expert content creator for "Cohort Zero", a tech startup incubator/venture builder.
Your goal is to grab the attention of aspiring founders, product developers, and entrepreneurs looking for funding and motivation.

I will provide a list of recent tech/startup news headlines. Select the most impactful ONE or TWO headlines (preferably one global startup news and one Pakistan tech news if available). 
Write an engaging Instagram/LinkedIn post (caption + script) about this news.

News Headlines:
${newsItems.map((n, i) => `${i + 1}. [${n.source}] ${n.title}`).join('\n')}

Format your output as a JSON object:
{
  "selected_news_titles": ["title1"],
  "caption": "Your engaging caption with emojis...",
  "hashtags": ["#startup", "#founder", "#tech"],
  "script_lines": ["Line 1 of text to show on screen", "Line 2 to show on screen"],
  "image_prompt": "A prompt for an AI background image (e.g. abstract neon startup office, cinematic lighting, 4k). Do not include any text, logos, or typography in the image prompt."
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
                { "role": "system", "content": "You output valid JSON." },
                { "role": "user", "content": prompt }
            ]
        })
    });

    if (!response.ok) {
        const err = await response.text();
        throw new Error(`OpenRouter API Error: ${err}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}

async function run() {
    const history = await loadHistory();
    const rawNews = await fetchAllNews();
    
    // Filter out old news
    const newItems = rawNews.filter(n => !history.includes(n.title));
    console.log(`Found ${newItems.length} new articles.`);

    if (newItems.length === 0) {
        console.log("No new articles found. Exiting.");
        return;
    }

    // Pass top 20 new items to LLM to prevent prompt explosion
    const topItems = newItems.slice(0, 20);

    try {
        const generated = await generateContent(topItems);
        console.log("Content generated successfully!");

        // Add selected to history
        generated.selected_news_titles.forEach(title => history.push(title));
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
