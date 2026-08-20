/**
 * make_carousel.mjs — Generates a branded multi-slide LinkedIn PDF carousel.
 * Each script_line becomes its own slide with the Cohort Zero branding.
 * Uses pdf-lib (no puppeteer, no browser needed).
 */
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

const SCRIPT_FILE = path.join(process.cwd(), 'data', 'script.json');
const ASSETS_DIR = path.join(process.cwd(), 'public', 'assets');
const OUT_DIR = path.join(process.cwd(), 'out');

// Brand colors
const ACCENT_R = 225 / 255, ACCENT_G = 29 / 255, ACCENT_B = 72 / 255;
const BG_R = 10 / 255, BG_G = 10 / 255, BG_B = 11 / 255;
const MUTED_R = 154 / 255, MUTED_G = 163 / 255, MUTED_B = 173 / 255;

const SLIDE_W = 1080;
const SLIDE_H = 1080;

async function createCarousel() {
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
    if (!fs.existsSync(SCRIPT_FILE)) {
        console.error("No script.json found. Run fetch step first.");
        return;
    }

    const scriptData = JSON.parse(fs.readFileSync(SCRIPT_FILE, 'utf-8'));
    const lines = scriptData.script_lines || [];
    const caption = scriptData.caption || '';
    const hashtags = (scriptData.hashtags || []).join(' ');
    const newsTitle = scriptData.selected_news_title || scriptData.selected_news_titles?.[0] || '';

    const pdfDoc = await PDFDocument.create();
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Try to embed logo
    let logoImage = null;
    const logoPath = path.join(ASSETS_DIR, 'logo.png');
    if (fs.existsSync(logoPath)) {
        const logoBytes = fs.readFileSync(logoPath);
        logoImage = await pdfDoc.embedPng(logoBytes);
    }

    // Try to embed background
    let bgImage = null;
    const bgPath = path.join(ASSETS_DIR, 'background.jpg');
    if (fs.existsSync(bgPath)) {
        const bgBytes = fs.readFileSync(bgPath);
        bgImage = await pdfDoc.embedJpg(bgBytes);
    }

    // Sanitize function to replace non-WinAnsi characters (smart quotes, em-dashes, etc.)
    const sanitizeText = (txt) => {
        if (!txt) return '';
        return txt
            .replace(/[\u2018\u2019]/g, "'") // smart single quotes
            .replace(/[\u201C\u201D]/g, '"') // smart double quotes
            .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, "-") // all dashes
            .replace(/[\u2026]/g, "...") // ellipsis
            .replace(/[^\x00-\xFF]/g, ""); // strip any remaining non-WinAnsi characters
    };

    // ─── SLIDE 1: COVER (hook + logo) ───
    const coverPage = pdfDoc.addPage([SLIDE_W, SLIDE_H]);
    coverPage.drawRectangle({ x: 0, y: 0, width: SLIDE_W, height: SLIDE_H, color: rgb(BG_R, BG_G, BG_B) });

    // Background image (dimmed)
    if (bgImage) {
        coverPage.drawImage(bgImage, { x: 0, y: 0, width: SLIDE_W, height: SLIDE_H, opacity: 0.25 });
    }

    // Logo
    if (logoImage) {
        const logoH = 60;
        const logoW = (logoImage.width / logoImage.height) * logoH;
        coverPage.drawImage(logoImage, { x: (SLIDE_W - logoW) / 2, y: SLIDE_H - 120, width: logoW, height: logoH });
    }

    // Accent bar
    coverPage.drawRectangle({ x: (SLIDE_W - 80) / 2, y: SLIDE_H - 160, width: 80, height: 4, color: rgb(ACCENT_R, ACCENT_G, ACCENT_B) });

    // Hook text (the first script line, wrapped)
    const hookText = sanitizeText(lines[0] || newsTitle);
    drawWrappedText(coverPage, hookText, fontBold, 42, rgb(1, 1, 1), SLIDE_W - 140, 70, SLIDE_H - 220);

    // "Swipe →" CTA at bottom
    coverPage.drawText('SWIPE ->', {
        x: SLIDE_W - 200, y: 60, size: 20, font: fontBold,
        color: rgb(ACCENT_R, ACCENT_G, ACCENT_B),
    });

    // "COHORT ZERO" at bottom-left
    coverPage.drawText('COHORT ZERO', {
        x: 70, y: 60, size: 16, font: fontBold, color: rgb(MUTED_R, MUTED_G, MUTED_B),
    });

    // ─── SLIDES 2..N: Content lines ───
    for (let i = 1; i < lines.length; i++) {
        const page = pdfDoc.addPage([SLIDE_W, SLIDE_H]);
        page.drawRectangle({ x: 0, y: 0, width: SLIDE_W, height: SLIDE_H, color: rgb(BG_R, BG_G, BG_B) });

        // Subtle BG
        if (bgImage) {
            page.drawImage(bgImage, { x: 0, y: 0, width: SLIDE_W, height: SLIDE_H, opacity: 0.1 });
        }

        // Slide number
        page.drawText(`${i + 1}/${lines.length + 1}`, {
            x: SLIDE_W - 140, y: SLIDE_H - 60, size: 18, font: fontRegular,
            color: rgb(MUTED_R, MUTED_G, MUTED_B),
        });

        // Accent bar left edge
        page.drawRectangle({ x: 60, y: SLIDE_H - 300, width: 4, height: 80, color: rgb(ACCENT_R, ACCENT_G, ACCENT_B) });

        // Content text
        drawWrappedText(page, sanitizeText(lines[i]), fontBold, 38, rgb(1, 1, 1), SLIDE_W - 180, 90, SLIDE_H - 280);

        // Logo small bottom-left
        if (logoImage) {
            const logoH = 35;
            const logoW = (logoImage.width / logoImage.height) * logoH;
            page.drawImage(logoImage, { x: 60, y: 50, width: logoW, height: logoH, opacity: 0.6 });
        }
    }

    // ─── LAST SLIDE: CTA ───
    const ctaPage = pdfDoc.addPage([SLIDE_W, SLIDE_H]);
    ctaPage.drawRectangle({ x: 0, y: 0, width: SLIDE_W, height: SLIDE_H, color: rgb(BG_R, BG_G, BG_B) });

    if (logoImage) {
        const logoH = 80;
        const logoW = (logoImage.width / logoImage.height) * logoH;
        ctaPage.drawImage(logoImage, { x: (SLIDE_W - logoW) / 2, y: SLIDE_H - 300, width: logoW, height: logoH });
    }

    // CTA pill (simulated with rectangle)
    const pillW = 420, pillH = 60;
    ctaPage.drawRectangle({
        x: (SLIDE_W - pillW) / 2, y: SLIDE_H / 2 - pillH / 2,
        width: pillW, height: pillH, borderRadius: 30,
        color: rgb(ACCENT_R, ACCENT_G, ACCENT_B),
    });
    ctaPage.drawText('FOLLOW @cohortzero', {
        x: (SLIDE_W - pillW) / 2 + 60, y: SLIDE_H / 2 - 8,
        size: 28, font: fontBold, color: rgb(BG_R, BG_G, BG_B),
    });

    ctaPage.drawText("Founders' Files", {
        x: (SLIDE_W - 160) / 2, y: SLIDE_H / 2 - 80,
        size: 20, font: fontRegular, color: rgb(MUTED_R, MUTED_G, MUTED_B),
    });

    // Save
    const pdfBytes = await pdfDoc.save();
    const dest = path.join(OUT_DIR, 'carousel.pdf');
    fs.writeFileSync(dest, pdfBytes);
    console.log(`Saved ${lines.length + 1}-slide carousel to ${dest}`);
}

/** Helper: wrap text to fit within maxWidth */
function drawWrappedText(page, text, font, size, color, maxWidth, x, startY) {
    const words = text.split(' ');
    let currentLine = '';
    let y = startY;
    const lineHeight = size * 1.4;

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(testLine, size);
        if (testWidth > maxWidth && currentLine) {
            page.drawText(currentLine, { x, y, size, font, color });
            currentLine = word;
            y -= lineHeight;
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine) {
        page.drawText(currentLine, { x, y, size, font, color });
    }
}

createCarousel().catch(console.error);
