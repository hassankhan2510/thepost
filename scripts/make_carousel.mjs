import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

const ASSETS_DIR = path.join(process.cwd(), 'public', 'assets');
const OUT_DIR = path.join(process.cwd(), 'out');

async function createPDF() {
    if (!fs.existsSync(OUT_DIR)) {
        fs.mkdirSync(OUT_DIR, { recursive: true });
    }

    const bgPath = path.join(ASSETS_DIR, 'background.jpg');
    if (!fs.existsSync(bgPath)) {
        console.error("Background image not found. Cannot create carousel.");
        return;
    }

    console.log("Creating LinkedIn PDF Carousel...");
    const pdfDoc = await PDFDocument.create();
    
    // Read the background image
    const bgImageBytes = fs.readFileSync(bgPath);
    const bgImage = await pdfDoc.embedJpg(bgImageBytes);
    
    // Create a 1080x1080 page (in points: 1080 * 0.75 = 810)
    const page = pdfDoc.addPage([810, 810]);
    
    // Draw the image filling the page
    page.drawImage(bgImage, {
        x: 0,
        y: 0,
        width: 810,
        height: 810,
    });
    
    // Note: To make this a true multi-page carousel, you would generate multiple
    // text slides in Remotion as a JPEG sequence, and append them here.
    // For now, this generates a 1-page PDF suitable for a standard document post.

    const pdfBytes = await pdfDoc.save();
    const dest = path.join(OUT_DIR, 'carousel.pdf');
    fs.writeFileSync(dest, pdfBytes);
    console.log(`Saved LinkedIn Carousel to ${dest}`);
}

createPDF().catch(console.error);
