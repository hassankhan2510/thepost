/**
 * opportunity_radar.mjs — Beast-Mode Opportunity Radar
 *
 * Runs 44+ Google Dork queries + 10 direct website reads daily.
 * Passes all results through a 3-phase AI intelligence filter.
 * Sends a categorized, relevance-ranked report to Discord.
 *
 * Secrets required:
 *   OPENROUTER_API_KEY
 *   JINA_API_KEY
 *   DISCORD_RADAR_WEBHOOK
 */

import fs from 'fs';
import path from 'path';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const JINA_API_KEY = process.env.JINA_API_KEY;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_RADAR_WEBHOOK;

if (!OPENROUTER_API_KEY || !JINA_API_KEY || !DISCORD_WEBHOOK_URL) {
    console.error('Missing required environment variables: OPENROUTER_API_KEY, JINA_API_KEY, DISCORD_RADAR_WEBHOOK');
    process.exit(1);
}

// ─── Date Helpers ──────────────────────────────────────────────────────────────
function getYesterday() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0]; // e.g. "2026-08-21"
}

function getToday() {
    return new Date().toISOString().split('T')[0];
}

// ─── Rate-limit safe delay ─────────────────────────────────────────────────────
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── PHASE 1A: The Dork Library ───────────────────────────────────────────────
function buildDorkQueries(yesterday) {
    const d = yesterday;
    return [
        // ── Accelerators & Incubators ──────────────────────────────────────────
        `site:linkedin.com/posts ("applications open" OR "now accepting" OR "apply now") (incubator OR accelerator) after:${d}`,
        `site:linkedin.com/posts ("Y Combinator" OR "YC" OR "Techstars" OR "500 Global") (batch OR applications OR apply OR deadline) after:${d}`,
        `site:linkedin.com/posts ("Antler" OR "Plug and Play" OR "Seedstars" OR "Founder Institute") (cohort OR applications OR apply) after:${d}`,
        `site:linkedin.com/posts ("NIC" OR "National Incubation Center" OR "Plan9" OR "LUMS" OR "NUST TIP") (Islamabad OR Pakistan OR Lahore) after:${d}`,
        `site:linkedin.com/posts ("Invest2Innovate" OR "i2i" OR "Jazz xlr8" OR "Ignite" OR "PSEB") (program OR apply OR startups) after:${d}`,
        `site:linkedin.com/posts "startup program" ("Google" OR "Microsoft" OR "AWS" OR "Meta" OR "NVIDIA") (apply OR credits OR accelerator) after:${d}`,
        `("applications open" OR "apply now") (accelerator OR incubator) (startups OR founders) -job after:${d}`,
        `site:f6s.com (Pakistan OR remote OR virtual OR global) (accelerator OR incubator) after:${d}`,

        // ── Fellowships & Grants ───────────────────────────────────────────────
        `site:linkedin.com/posts ("fellowship" OR "grant" OR "scholarship") ("applications open" OR "apply now" OR "deadline") after:${d}`,
        `site:linkedin.com/posts ("United Nations" OR "UNDP" OR "UNICEF" OR "UNITAR" OR "UN Women") (fellowship OR program OR apply OR youth) after:${d}`,
        `site:linkedin.com/posts ("MIT Solve" OR "Millennium Fellowship" OR "Echoing Green" OR "Ashoka") (apply OR applications OR challenge) after:${d}`,
        `site:linkedin.com/posts ("Fulbright" OR "Chevening" OR "Commonwealth" OR "Rhodes" OR "Schwarzman") (scholarship OR fellowship OR apply) after:${d}`,
        `site:linkedin.com/posts ("Obama Foundation" OR "Mandela Washington" OR "Acumen" OR "GLG") (fellowship OR program OR applications) after:${d}`,
        `site:linkedin.com/posts ("World Bank" OR "Asian Development Bank" OR "IFC" OR "USAID") (grant OR program OR innovation OR youth) after:${d}`,
        `site:linkedin.com/posts ("Gates Foundation" OR "Google.org" OR "Skoll" OR "Omidyar") (grant OR challenge OR fund OR apply) after:${d}`,
        `site:linkedin.com/posts ("Hult Prize" OR "Enactus" OR "Global Innovation" OR "social enterprise") (competition OR apply OR challenge) after:${d}`,

        // ── Virtual Events & Conferences ───────────────────────────────────────
        `site:linkedin.com/posts ("virtual event" OR "virtual conference" OR "virtual summit" OR "online event") (AI OR technology OR startup OR founders) after:${d}`,
        `site:linkedin.com/posts ("webinar" OR "masterclass" OR "workshop") (AI OR startup OR venture OR founders) ("register" OR "join" OR "free") after:${d}`,
        `site:linkedin.com/posts ("Web Summit" OR "TechCrunch" OR "Collision" OR "RISE" OR "Slush") (register OR tickets OR virtual) after:${d}`,
        `site:linkedin.com/posts ("Harvard" OR "MIT" OR "Stanford" OR "Oxford" OR "Cambridge") (conference OR summit OR virtual) (Asia OR global OR online) after:${d}`,
        `site:linkedin.com/posts ("demo day" OR "pitch competition" OR "startup showcase" OR "founders day") (virtual OR online OR register) after:${d}`,
        `site:eventbrite.com (Pakistan OR Islamabad OR virtual OR online) (technology OR startup OR AI OR business OR networking) after:${d}`,
        `site:meetup.com (Islamabad OR Pakistan OR virtual) (tech OR startup OR AI OR developer OR entrepreneur) after:${d}`,

        // ── Pakistan / Islamabad Local ─────────────────────────────────────────
        `site:linkedin.com/posts ("Islamabad" OR "Rawalpindi") (meetup OR event OR networking OR conference OR workshop) after:${d}`,
        `site:linkedin.com/posts ("Lahore" OR "Karachi") (tech OR startup OR AI) (meetup OR event OR conference) after:${d}`,
        `site:linkedin.com/posts ("Pakistan" OR "Pakistani") (founders OR startup OR tech) ("launching" OR "expanding" OR "meetup") after:${d}`,
        `site:linkedin.com/posts ("PITB" OR "Punjab IT Board" OR "KP IT Board" OR "Ministry of IT") (program OR initiative OR digital OR apply) after:${d}`,
        `("Pakistan" OR "Islamabad") ("startup weekend" OR "hackathon" OR "bootcamp" OR "tech fest") after:${d}`,
        `site:techjuice.pk (event OR conference OR startup OR apply OR program) after:${d}`,

        // ── Hackathons & Competitions ──────────────────────────────────────────
        `site:linkedin.com/posts ("hackathon" OR "hack" OR "build") (AI OR blockchain OR health OR climate) ("register" OR "apply" OR "join") after:${d}`,
        `site:devpost.com (hackathon OR challenge) (AI OR machine-learning OR health OR fintech) after:${d}`,
        `("call for applications" OR "call for proposals") (innovation OR technology OR AI OR social-impact) after:${d}`,
        `site:linkedin.com/posts ("TiE" OR "GIST" OR "Global Startup" OR "Seedstars") (competition OR pitch OR apply) after:${d}`,
        `site:linkedin.com/posts ("Google" OR "Microsoft" OR "Meta" OR "Amazon") (challenge OR hackathon OR competition OR prize) (apply OR register) after:${d}`,

        // ── Research, Fellowships & Intl Programs ──────────────────────────────
        `site:linkedin.com/posts ("call for papers" OR "CFP") (AI OR machine-learning OR deep-learning) (deadline OR submit) after:${d}`,
        `site:linkedin.com/posts ("research program" OR "research internship" OR "visiting researcher") (Google OR DeepMind OR Meta OR Microsoft OR OpenAI) after:${d}`,
        `site:linkedin.com/posts ("PhD" OR "postdoc" OR "research fellow") (AI OR machine-learning) (remote OR Pakistan OR virtual) after:${d}`,

        // ── Broad Discovery Sweeps ─────────────────────────────────────────────
        `site:linkedin.com/posts ("founder" OR "startup") ("apply" OR "register" OR "open") (Pakistan OR Islamabad OR "South Asia") after:${d}`,
        `site:linkedin.com/posts ("social impact" OR "SDGs" OR "climate" OR "health tech") (grant OR fellowship OR challenge OR prize) after:${d}`,
        `"open for applications" (startup OR founder OR fellowship OR grant OR accelerator) after:${d}`,
        `site:linkedin.com/posts ("virtual" OR "online") ("meetup" OR "networking" OR "summit") (founder OR entrepreneur OR builder) after:${d}`,
        `site:linkedin.com/posts ("cohort" OR "program") ("applications open" OR "apply now") (2026 OR 2027) after:${d}`,
        `site:linkedin.com/posts ("AI" OR "machine learning" OR "deep tech") (challenge OR competition OR prize) ("apply" OR "submit") after:${d}`,
    ];
}

// ─── PHASE 1B: Direct Website Monitoring URLs ─────────────────────────────────
const DIRECT_URLS = [
    'https://www.ycombinator.com/apply',
    'https://www.techstars.com/accelerators',
    'https://nicpakistan.pk',
    'https://solve.mit.edu/challenges',
    'https://www.hultprize.org',
    'https://www.unv.org/become-volunteer',
    'https://www.f6s.com/programs',
    'https://www.eventbrite.com/d/pakistan--islamabad/events/',
    'https://devpost.com/hackathons',
    'https://www.seedstars.com/programs',
];

// ─── Jina AI Search (s.jina.ai) ───────────────────────────────────────────────
async function jinaSearch(query) {
    const encoded = encodeURIComponent(query);
    const url = `https://s.jina.ai/${encoded}`;
    try {
        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${JINA_API_KEY}`,
                'Accept': 'application/json',
                'X-Timeout': '15',
            },
        });
        if (!res.ok) {
            console.warn(`    ⚠ Jina search returned ${res.status} for query snippet: "${query.slice(0, 60)}"`);
            return null;
        }
        const data = await res.json();
        return data;
    } catch (err) {
        console.warn(`    ⚠ Jina search error: ${err.message}`);
        return null;
    }
}

// ─── Jina AI Reader (r.jina.ai) ───────────────────────────────────────────────
async function jinaRead(url) {
    const jinaUrl = `https://r.jina.ai/${url}`;
    try {
        const res = await fetch(jinaUrl, {
            headers: {
                'Authorization': `Bearer ${JINA_API_KEY}`,
                'X-Timeout': '20',
            },
        });
        if (!res.ok) {
            console.warn(`    ⚠ Jina reader returned ${res.status} for: ${url}`);
            return null;
        }
        const text = await res.text();
        // Truncate to 3000 chars to avoid massive token usage
        return text.slice(0, 3000);
    } catch (err) {
        console.warn(`    ⚠ Jina reader error: ${err.message}`);
        return null;
    }
}

// ─── OpenRouter LLM Call ──────────────────────────────────────────────────────
async function callLLM(systemPrompt, userPrompt, asJson = true) {
    try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'openrouter/free',
                ...(asJson ? { response_format: { type: 'json_object' } } : {}),
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
            }),
        });

        if (!res.ok) {
            console.warn(`    ⚠ OpenRouter returned ${res.status}: ${await res.text()}`);
            return null;
        }

        const data = await res.json();
        if (!data.choices?.[0]?.message?.content) return null;
        const raw = data.choices[0].message.content
            .replace(/^\s*```(json)?\n?/, '').replace(/```\s*$/, '');
        return asJson ? JSON.parse(raw) : raw;
    } catch (err) {
        console.warn(`    ⚠ LLM call failed: ${err.message}`);
        return null;
    }
}

// ─── PHASE 1C: AI-Generated Dynamic Dorks ─────────────────────────────────────
async function generateDynamicDorks(yesterday) {
    console.log('  🧠 Generating AI dynamic dorks...');
    const result = await callLLM(
        'You output valid JSON arrays only.',
        `You are a search intelligence agent for Hassan Khan, a startup founder in Islamabad, Pakistan.
His focus areas: AI/ML automation, social impact ventures (healthcare for albinism), venture building, geometric deep learning, content automation.

Today is ${getToday()}. Generate exactly 5 NEW, creative Google search queries that would find
opportunities Hassan has NEVER seen before. Think laterally:
- Emerging grants from obscure foundations
- University competitions in Asia/MENA
- Corporate innovation challenges (IBM, Huawei, SAP, Siemens)
- Government digital transformation programs (EU, DFID, KOICA)
- Climate/health/fintech-specific incubators
- UNESCO, OECD, WIPO programs
Each query MUST include "after:${yesterday}" for freshness.
Use site:linkedin.com/posts where appropriate.
Output as JSON: { "dorks": ["query1", "query2", "query3", "query4", "query5"] }`
    );

    if (result?.dorks && Array.isArray(result.dorks)) {
        console.log(`  ✓ Generated ${result.dorks.length} dynamic dorks`);
        return result.dorks;
    }
    return [];
}

// ─── PHASE 2A: Batch Extraction ───────────────────────────────────────────────
async function extractOpportunities(rawContentItems) {
    const SYSTEM = 'You are an opportunity extraction engine. You output valid JSON arrays only.';
    const USER = `You are scanning raw web search results for actionable opportunities.
Extract ONLY legitimate, actionable items where someone can apply, register, or attend RIGHT NOW.

STRICT RULES:
- ONLY extract items with a clear call-to-action (apply/register/submit/attend/join)
- IGNORE: generic advice posts, old events, job listings, spam, motivational quotes, news about past events
- IGNORE anything where the deadline/event date has clearly passed

For each genuine opportunity output exactly this JSON structure:
{
  "name": "Full name of the event/program/fellowship",
  "type": "accelerator|fellowship|grant|conference|meetup|hackathon|workshop|competition|call-for-papers|other",
  "deadline_or_date": "Specific date if found, otherwise 'Check link'",
  "location": "City name or 'Virtual/Online' or 'Global'",
  "organizer": "Organization/company name",
  "url": "Direct link to the opportunity (most specific URL found)",
  "summary": "One powerful sentence explaining what this is and why it matters",
  "relevance_tags": ["AI", "Pakistan", "startups", "fellowship"] 
}

Output as JSON: { "opportunities": [...] }
If absolutely nothing qualifies, output: { "opportunities": [] }

RAW DATA TO ANALYZE:
${rawContentItems}`;

    const result = await callLLM(SYSTEM, USER);
    return result?.opportunities || [];
}

// ─── PHASE 2B: Deduplicate + Score ────────────────────────────────────────────
async function deduplicateAndScore(allOpportunities) {
    if (allOpportunities.length === 0) return [];

    console.log(`  🧠 Deduplicating and scoring ${allOpportunities.length} raw opportunities...`);
    const SYSTEM = 'You are Hassan Khan\'s personal intelligence officer. You output valid JSON only.';
    const USER = `Hassan Khan is a startup founder and AI researcher in Islamabad, Pakistan.
His priorities (ranked):
1. AI/ML, automation, deep tech startups
2. Social impact ventures (healthcare, albinism tech - AlbiSight)
3. Venture building and investment (Hassan Ventures)
4. Pakistan / South Asia ecosystem opportunities
5. International exposure (UN, MIT, Harvard, Oxford programs)
6. Geometric deep learning, tropical geometry research

Here is today's raw opportunity list:
${JSON.stringify(allOpportunities, null, 2)}

Your tasks:
1. DEDUPLICATE: Merge or remove items that are clearly the same opportunity found via different queries
2. GEO-FILTER (CRITICAL): If an event requires PHYSICAL attendance and is NOT located in Pakistan (e.g., India, UK, USA, Europe), YOU MUST SCORE IT 1 (Reject). ONLY accept physical events in Pakistan. You MAY accept global/virtual/online events, or global fellowships (like YC or UN) where remote participation or travel is standard.
3. SCORE each unique opportunity 1-5 for relevance to Hassan:
   - 5 = Perfect match (AI incubator in Pakistan, UN fellowship for young founders, virtual event for MENA founders)
   - 4 = Strong match (global virtual startup event, tech grant open globally, AI hackathon)
   - 3 = Good match (general tech conference, broad fellowship, tangential tech event)
   - 2 = Weak match (tangentially related, very broad)
   - 1 = Not relevant (skip) or fails the GEO-FILTER
4. REMOVE all items scored 1
5. SORT by score descending (5 first)

Output as JSON: { "opportunities": [...with "score" field added to each...] }`;

    const result = await callLLM(SYSTEM, USER);
    return result?.opportunities || allOpportunities;
}

// ─── PHASE 2C: Format Final Report ────────────────────────────────────────────
async function formatReport(scoredOpportunities, today) {
    if (scoredOpportunities.length === 0) {
        return `📡 **Opportunity Radar — ${today}**\n\nNo new opportunities found in the last 24 hours. The system will scan again tomorrow.`;
    }

    console.log(`  🧠 Formatting final report for ${scoredOpportunities.length} opportunities...`);
    const SYSTEM = 'You are a precise formatter. You output clean Discord-compatible Markdown text only. No JSON.';
    const USER = `Format these opportunities into a clean, actionable daily intelligence brief for Discord.

Use these exact categories (only include a category if it has items):
🔥 **CRITICAL — DON'T MISS** (score 5)
🚀 **Accelerators & Incubators**
🎓 **Fellowships & Grants**
🌍 **Virtual Events & Conferences**
🇵🇰 **Pakistan / Islamabad Local**
💻 **Hackathons & Competitions**

For each item use EXACTLY this format (keep it tight for Discord):
> **{Name}** — _{Organizer}_
> 📅 {deadline_or_date} | 📍 {location}
> {summary}
> 🔗 {url}

Rules:
- Start with one header line: "📡 **Daily Intelligence Brief — ${today}**"
- Then one summary line: "Found **X opportunities** across **Y categories**."
- Then the categorized list
- Keep each item to 4 lines max (the format above)
- If score is 5, also add ⭐ to the item's name
- Omit categories with zero items
- End with: "_— Autonomous Opportunity Radar | Runs daily at 8 AM PKT_"

OPPORTUNITIES TO FORMAT:
${JSON.stringify(scoredOpportunities, null, 2)}`;

    const result = await callLLM(SYSTEM, USER, false);
    return result || `📡 **Opportunity Radar — ${today}**\n\nError formatting report. Raw data saved.`;
}

// ─── PHASE 3: Discord Delivery ─────────────────────────────────────────────────
async function sendToDiscord(report) {
    // Discord embed description limit is 4096 chars
    // If report is longer, split into multiple messages
    const LIMIT = 3900;
    const chunks = [];

    if (report.length <= LIMIT) {
        chunks.push(report);
    } else {
        let remaining = report;
        while (remaining.length > 0) {
            if (remaining.length <= LIMIT) {
                chunks.push(remaining);
                break;
            }
            // Split at last newline before the limit
            let cutAt = remaining.lastIndexOf('\n', LIMIT);
            if (cutAt === -1) cutAt = LIMIT;
            chunks.push(remaining.slice(0, cutAt));
            remaining = remaining.slice(cutAt).trim();
        }
    }

    console.log(`  📨 Sending ${chunks.length} Discord message(s)...`);

    for (let i = 0; i < chunks.length; i++) {
        const payload = {
            username: '🎯 Opportunity Radar',
            embeds: [{
                description: chunks[i],
                color: 0x38BDF8,
                ...(i === 0 ? {
                    thumbnail: { url: 'https://cdn-icons-png.flaticon.com/512/2942/2942813.png' }
                } : {}),
            }]
        };

        const res = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            console.error(`  ✗ Discord webhook failed: ${res.status} ${await res.text()}`);
        } else {
            console.log(`  ✓ Discord message ${i + 1}/${chunks.length} sent`);
        }

        if (i < chunks.length - 1) await sleep(1000);
    }
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────
async function run() {
    const yesterday = getYesterday();
    const today = getToday();

    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║     🎯 OPPORTUNITY RADAR — BEAST MODE             ║');
    console.log(`║     Scanning for opportunities since: ${yesterday}  ║`);
    console.log('╚══════════════════════════════════════════════════╝\n');

    // ── PHASE 1A: Build & run all dork queries ─────────────────────────────────
    const staticDorks = buildDorkQueries(yesterday);
    console.log(`📡 Phase 1A: Running ${staticDorks.length} static dork queries...`);

    const searchResults = [];
    for (let i = 0; i < staticDorks.length; i++) {
        const query = staticDorks[i];
        process.stdout.write(`  [${i + 1}/${staticDorks.length}] Searching: ${query.slice(0, 70)}...\r`);
        const result = await jinaSearch(query);
        if (result) {
            // Jina returns array of results; serialize relevant fields
            const items = Array.isArray(result) ? result : (result.data || []);
            for (const item of items.slice(0, 6)) {
                searchResults.push({
                    source: 'dork',
                    query: query.slice(0, 80),
                    title: item.title || '',
                    url: item.url || '',
                    content: (item.content || item.description || '').slice(0, 500),
                });
            }
        }
        await sleep(3000); // 3s delay between Jina search calls
    }
    console.log(`\n  ✓ Collected ${searchResults.length} raw search results`);

    // ── PHASE 1B: Direct website reads ────────────────────────────────────────
    console.log(`\n📡 Phase 1B: Reading ${DIRECT_URLS.length} direct organization pages...`);
    const directReads = [];
    for (let i = 0; i < DIRECT_URLS.length; i++) {
        const url = DIRECT_URLS[i];
        process.stdout.write(`  [${i + 1}/${DIRECT_URLS.length}] Reading: ${url}\r`);
        const content = await jinaRead(url);
        if (content) {
            directReads.push({ source: 'direct', url, content });
        }
        await sleep(2000);
    }
    console.log(`\n  ✓ Read ${directReads.length} direct pages`);

    // ── PHASE 1C: AI-generated dynamic dorks ──────────────────────────────────
    console.log('\n📡 Phase 1C: Generating AI dynamic dorks...');
    await sleep(5000);
    const dynamicDorks = await generateDynamicDorks(yesterday);

    if (dynamicDorks.length > 0) {
        console.log(`  Running ${dynamicDorks.length} dynamic dork queries...`);
        for (let i = 0; i < dynamicDorks.length; i++) {
            process.stdout.write(`  [${i + 1}/${dynamicDorks.length}] Dynamic: ${dynamicDorks[i].slice(0, 70)}...\r`);
            const result = await jinaSearch(dynamicDorks[i]);
            if (result) {
                const items = Array.isArray(result) ? result : (result.data || []);
                for (const item of items.slice(0, 5)) {
                    searchResults.push({
                        source: 'dynamic_dork',
                        title: item.title || '',
                        url: item.url || '',
                        content: (item.content || item.description || '').slice(0, 500),
                    });
                }
            }
            await sleep(3000);
        }
        console.log(`\n  ✓ Total raw results: ${searchResults.length}`);
    }

    // ── PHASE 2A: Batch extraction (split into batches of ~10 results) ─────────
    console.log('\n🧠 Phase 2A: AI extraction — filtering noise...');
    const BATCH_SIZE = 10;
    const allRaw = [
        ...searchResults.map(r => `TITLE: ${r.title}\nURL: ${r.url}\nCONTENT: ${r.content}`),
        ...directReads.map(r => `SOURCE: ${r.url}\nCONTENT: ${r.content}`),
    ];

    const allExtracted = [];
    const batches = [];
    for (let i = 0; i < allRaw.length; i += BATCH_SIZE) {
        batches.push(allRaw.slice(i, i + BATCH_SIZE));
    }

    console.log(`  Processing ${batches.length} batches...`);
    for (let i = 0; i < batches.length; i++) {
        process.stdout.write(`  Batch ${i + 1}/${batches.length}...\r`);
        await sleep(5000);
        const extracted = await extractOpportunities(batches[i].join('\n\n---\n\n'));
        allExtracted.push(...extracted);
        console.log(`  ✓ Batch ${i + 1}/${batches.length}: extracted ${extracted.length} opportunities`);
    }

    console.log(`\n  ✓ Total extracted before dedup: ${allExtracted.length}`);

    if (allExtracted.length === 0) {
        console.log('  No opportunities found today. Sending empty report.');
        await sendToDiscord(`📡 **Opportunity Radar — ${today}**\n\nNo new opportunities found in the last 24 hours matching your profile. The system scanned ${staticDorks.length + dynamicDorks.length} queries.\n\n_— Autonomous Opportunity Radar | Runs daily at 8 AM PKT_`);
        return;
    }

    // ── PHASE 2B: Dedup + score ────────────────────────────────────────────────
    await sleep(5000);
    const scored = await deduplicateAndScore(allExtracted);
    console.log(`  ✓ After dedup + scoring: ${scored.length} unique opportunities`);

    // ── PHASE 2C: Format ──────────────────────────────────────────────────────
    await sleep(5000);
    const report = await formatReport(scored, today);

    // Save report locally as artifact
    const outDir = path.join(process.cwd(), 'out');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'opportunity_report.md'), report, 'utf-8');
    fs.writeFileSync(path.join(outDir, 'opportunities_raw.json'), JSON.stringify(scored, null, 2), 'utf-8');

    console.log('\n  ✓ Report saved to out/opportunity_report.md');

    // ── PHASE 3: Discord delivery ─────────────────────────────────────────────
    console.log('\n📨 Phase 3: Sending to Discord...');
    await sendToDiscord(report);

    console.log('\n✅ Opportunity Radar complete!\n');
    console.log(`  Queries run:     ${staticDorks.length + dynamicDorks.length}`);
    console.log(`  Raw results:     ${searchResults.length + directReads.length}`);
    console.log(`  After AI filter: ${allExtracted.length}`);
    console.log(`  Final report:    ${scored.length} unique opportunities\n`);
}

run().catch(err => {
    console.error('Opportunity Radar failed:', err);
    process.exit(1);
});
