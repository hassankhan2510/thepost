/**
 * intel.mjs — the AI intelligence layer.
 *
 * Turns raw scraped items into scored, classified opportunities/roles. Runs in SMALL BATCHES
 * (never one giant call) so nothing gets dropped. Every LLM failure is logged loudly and the
 * batch is retried with fallback models — no more silent nulls like v1.
 */

import { CONFIG, PROFILE, ROLE_LANES } from './config.mjs';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const sleep = ms => new Promise(r => setTimeout(r, ms));

export const llmStats = { calls: 0, ok: 0, failed: 0, modelUsed: CONFIG.LLM_MODEL };

// ─── Core LLM call with model fallback ────────────────────────────────────────
async function callLLM(systemPrompt, userPrompt) {
    const models = [CONFIG.LLM_MODEL, ...CONFIG.LLM_FALLBACKS];
    for (const model of models) {
        llmStats.calls++;
        try {
            const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://github.com/hassankhan2510/thepost',
                    'X-Title': 'Personal Radar',
                },
                body: JSON.stringify({
                    model,
                    response_format: { type: 'json_object' },
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt },
                    ],
                }),
            });
            if (!res.ok) {
                const body = await res.text();
                console.warn(`    ⚠ LLM ${res.status} on ${model}: ${body.slice(0, 140)}`);
                llmStats.failed++;
                continue; // try next model
            }
            const data = await res.json();
            const content = data.choices?.[0]?.message?.content;
            if (!content) { llmStats.failed++; continue; }
            const raw = content.replace(/^\s*```(json)?\n?/, '').replace(/```\s*$/, '');
            const parsed = JSON.parse(raw);
            llmStats.ok++;
            llmStats.modelUsed = model;
            return parsed;
        } catch (err) {
            console.warn(`    ⚠ LLM error on ${model}: ${err.message}`);
            llmStats.failed++;
        }
    }
    return null; // all models failed for this batch
}

// ─── Cheap pre-filter (no LLM) ────────────────────────────────────────────────
// Drops obviously-onsite roles for Lane B without burning an LLM call.
const ONSITE_RE = /\b(on-?site|in-office|hybrid)\b/i;
const REMOTE_RE = /\b(remote|work from home|wfh|worldwide|anywhere|distributed|virtual|async)\b/i;

export function preFilter(items) {
    return items.filter(it => {
        const blob = `${it.title} ${it.text}`.toLowerCase();
        // For role items, require some remote signal OR keep if unknown (LLM decides later).
        if (it.lane === 'role' && ONSITE_RE.test(blob) && !REMOTE_RE.test(blob)) return false;
        return true;
    });
}

// ─── Batch analyze: extract + classify + score in one pass per small batch ────
async function analyzeBatch(items) {
    const laneList = ROLE_LANES.map(l => `${l.key} (${l.match})`).join('\n  - ');
    const SYSTEM = 'You are Hassan Khan\'s personal opportunity intelligence officer. Output valid JSON only.';
    const USER = `PROFILE:
${PROFILE}

ROLE LANES (for jobs/gigs/founder posts):
  - ${laneList}

TASK: Analyze the raw items below. For EACH item that is a genuine, actionable, CURRENTLY-OPEN
opportunity for Hassan, output an object. DROP anything expired, purely informational, spam, or a
saturated mega-corp job listing with hundreds of applicants and no human contact.

Two kinds of items:
A) ROLE = a job/gig/founder/cofounder opportunity for Hassan. MUST be REMOTE / remote-friendly /
   worldwide / virtual (he works from Pakistan, cannot relocate). Reject clearly onsite-only roles
   outside Pakistan. PREFER posts where a real person is looking for a person ("I'm looking for a
   cofounder", "we're a small team hiring", "founding engineer", "DM me", "reach out") over generic
   ATS listings. Penalize saturation ("Easy Apply", ">100 applicants", aggregator reposts).
B) OPP = an opportunity/event: fellowship, grant, accelerator, hackathon, competition, conference,
   summit, webinar, seminar, meetup, workshop.
   GEO / ATTENDANCE RULE (apply strictly — Hassan attends ONLY: physical events IN PAKISTAN, and
   ONLINE events ANYWHERE in the world):
     • ONLINE / VIRTUAL / REMOTE event (any type, any host country) → ACCEPT.
     • PHYSICAL / IN-PERSON event located IN PAKISTAN → ACCEPT.
     • PHYSICAL / IN-PERSON event located in ANY OTHER country (India, Australia, UK, US, UAE, etc.)
       and NOT attendable online → REJECT (score 1). He cannot travel to attend it.
     • GLOBAL fellowship / grant / accelerator / program / competition that is applied to remotely
       and open worldwide → ACCEPT even if the organizer is foreign (participation is not tied to a
       physical location). Do NOT reject these just because the org is abroad.
   When unsure whether an event is online or requires physical presence abroad, treat it as physical
   and REJECT unless it clearly states virtual/online/remote attendance or is a global remote program.

For each kept item output:
{
  "kind": "role" | "opp",
  "name": "clear title of the role/opportunity",
  "org": "company / organizer / person",
  "lane": "<one of the role-lane keys if kind=role, else ''>",
  "opp_category": "events_pk|fellowships|accelerator|hackathon|conference|'' (if kind=opp)",
  "remote": true|false,
  "person_post": true|false,   // true if a real person is directly looking (not a job board)
  "date": "specific date/deadline if found, else 'Check link'",
  "location": "city or 'Remote'/'Virtual'/'Global'",
  "url": "most specific link",
  "why_fit": "ONE sentence: why this fits Hassan + which CV to send",
  "score": 1-5   // 5 = perfect (remote founding/AI role, disability fellowship, PK/virtual event); 1 = reject
}

Rules: score 1 items are dropped by us, so only include items you'd score >=2. Be strict on remote
and on expiry. Output JSON: { "items": [ ... ] }. If nothing qualifies: { "items": [] }.

RAW ITEMS:
${items.map((it, i) => `[#${i}] SOURCE:${it.source} GROUP:${it.group}\nTITLE: ${it.title}\nURL: ${it.url}\nTEXT: ${it.text}`).join('\n\n---\n\n')}`;

    const result = await callLLM(SYSTEM, USER);
    return (result?.items || []).filter(x => x && x.score >= 2);
}

/**
 * Analyze all items in small batches. Returns flat array of scored items.
 */
export async function analyzeAll(items) {
    const batches = [];
    for (let i = 0; i < items.length; i += CONFIG.ANALYZE_BATCH_SIZE) {
        batches.push(items.slice(i, i + CONFIG.ANALYZE_BATCH_SIZE));
    }
    console.log(`🧠 Analyzing ${items.length} items in ${batches.length} batches of ${CONFIG.ANALYZE_BATCH_SIZE}...`);
    const out = [];
    for (let i = 0; i < batches.length; i++) {
        process.stdout.write(`  batch ${i + 1}/${batches.length}...\r`);
        const kept = await analyzeBatch(batches[i]);
        out.push(...kept);
        console.log(`  ✓ batch ${i + 1}/${batches.length}: kept ${kept.length}`);
        await sleep(CONFIG.LLM_DELAY_MS);
    }
    console.log(`  ✓ Analyzed: ${out.length} scored items kept`);
    return out;
}
