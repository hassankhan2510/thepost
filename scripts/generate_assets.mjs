import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const SCRIPT_FILE = path.join(process.cwd(), 'data', 'script.json');
const ASSETS_DIR = path.join(process.cwd(), 'public', 'assets');
const LOCAL_LOGO = path.join(ASSETS_DIR, 'logo.png');

async function downloadImage(url, dest) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const buffer = await response.buffer();
    fs.writeFileSync(dest, buffer);
}

async function run() {
    if (!fs.existsSync(ASSETS_DIR)) {
        fs.mkdirSync(ASSETS_DIR, { recursive: true });
    }

    if (!fs.existsSync(SCRIPT_FILE)) {
        console.error("No script.json found. Run fetch_news.mjs first.");
        return;
    }

    const scriptData = JSON.parse(fs.readFileSync(SCRIPT_FILE, 'utf-8'));
    
    console.log("Generating background images via Pollinations AI...");
    
    const slides = scriptData.slides || [];
    if (slides.length === 0) {
        // Fallback for old scripts
        slides.push({ image_prompt: scriptData.image_prompt || "Abstract neon startup office, cinematic lighting, 4k" });
    }

    for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const promptText = slide.image_prompt || "corporate business scene, dark lighting, cinematic 4k";
        const prompt = encodeURIComponent(promptText);
        // Using pollinations AI. Adding seed to avoid caching identical images if prompts are similar
        const bgUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1080&height=1920&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;
        const bgDest = path.join(ASSETS_DIR, `bg_${i}.jpg`);
        
        try {
            await downloadImage(bgUrl, bgDest);
            console.log(`Saved background image ${i} to ${bgDest}`);
        } catch (err) {
            console.error(`Error downloading image ${i}:`, err.message);
        }
    }

    if (fs.existsSync(LOCAL_LOGO)) {
        console.log(`Logo present at ${LOCAL_LOGO}`);
    } else {
        console.warn(`Logo not found at ${LOCAL_LOGO}! Make sure logo.png is committed to public/assets.`);
    }
}

run();
