import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const SCRIPT_FILE = path.join(process.cwd(), 'data', 'script.json');
const ASSETS_DIR = path.join(process.cwd(), 'public', 'assets');
const LOGO_SOURCE = path.join(process.cwd(), '..', 'Youtube_Automation', 'branding', 'cohortzero-logo.png');

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
    
    console.log("Generating background image via Pollinations AI...");
    const prompt = encodeURIComponent(scriptData.image_prompt || "Abstract neon startup office, cinematic lighting, 4k");
    const bgUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1080&height=1920&nologo=true`;
    const bgDest = path.join(ASSETS_DIR, 'background.jpg');
    
    try {
        await downloadImage(bgUrl, bgDest);
        console.log(`Saved background image to ${bgDest}`);
    } catch (err) {
        console.error("Error downloading image:", err.message);
    }

    console.log("Copying Cohort Zero logo...");
    const logoDest = path.join(ASSETS_DIR, 'logo.png');
    if (fs.existsSync(LOGO_SOURCE)) {
        fs.copyFileSync(LOGO_SOURCE, logoDest);
        console.log(`Copied logo to ${logoDest}`);
    } else {
        console.warn(`Logo not found at ${LOGO_SOURCE}! Make sure the path is correct.`);
    }
}

run();
