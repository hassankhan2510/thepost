import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const SCRIPT_FILE = path.join(process.cwd(), 'data', 'render_props.json');

function run() {
    if (!fs.existsSync(SCRIPT_FILE)) {
        console.error("No render_props.json found.");
        process.exit(1);
    }
    const data = JSON.parse(fs.readFileSync(SCRIPT_FILE, 'utf-8'));
    const slides = data.scriptData?.slides || [];
    // Render frames 0 through slides.length (slides.length is the outro slide)
    const frames = `0-${slides.length}`;
    
    console.log(`Rendering Carousel frames: ${frames}`);
    
    try {
        // Output format will be slide-00.png, slide-01.png, etc.
        execSync(`npx remotion render src/index.ts Carousel out/carousel --sequence --image-format=png --props=data/render_props.json --frames=${frames}`, { stdio: 'inherit' });
        console.log("Carousel rendered successfully to out/carousel/");
    } catch (err) {
        console.error("Failed to render carousel");
        process.exit(1);
    }
}

run();
