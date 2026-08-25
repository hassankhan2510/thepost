/**
 * personal_radar.mjs — Personal Radar v2 orchestrator.
 *
 * Two lanes in one daily run:
 *   A) Opportunities & events (fellowships, accelerators, hackathons, PK/virtual events)
 *   B) Roles for Hassan (remote-only jobs/gigs/founder & cofounder posts across 7 CV lanes)
 *
 * Free stack: Google Programmable Search (dorks) + HN/RemoteOK/Remotive/Himalayas/WWR/Reddit.
 * All scraped data is saved COMPLETE to data/radar_raw_YYYY-MM-DD.json before filtering, then
 * committed to the repo by the GitHub Action. Filtered/scored output goes to two Discord channels.
 *
 * Secrets: OPENROUTER_API_KEY, GOOGLE_CSE_KEY, GOOGLE_CSE_CX,
 *          DISCORD_RADAR_WEBHOOK, DISCORD_ROLES_WEBHOOK (optional)
 */

import fs from 'fs';
import path from 'path';
import { CONFIG } from './radar/config.mjs';
import { DORK_POOL, sampleDorks } from './radar/dorks.mjs';
import { runDorks, searchStats, PROVIDER } from './radar/search.mjs';
import { fetchAllSources, sourceStats } from './radar/sources.mjs';
import { preFilter, analyzeAll, llmStats } from './radar/intel.mjs';
import { loadSeen, filterUnseen, updateSeen, saveSeen, mergeDuplicates } from './radar/dedup.mjs';
import { deliver } from './radar/discord.mjs';

function todayIso() { return new Date().toISOString().split('T')[0]; }
function dayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

function writeJson(file, data) {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

async function run() {
    const today = todayIso();
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║        🎯 PERSONAL RADAR v2                 ║');
    console.log(`║        ${today}                        ║`);
    console.log('╚════════════════════════════════════════════╝\n');

    if (!process.env.OPENROUTER_API_KEY) {
        console.error('FATAL: OPENROUTER_API_KEY not set.');
        process.exit(1);
    }

    // ── PHASE 1: Collect ──────────────────────────────────────────────────────
    const dorks = sampleDorks(CONFIG.DAILY_DORK_COUNT, dayOfYear());
    console.log(`📡 Phase 1: ${dorks.length} dorks (of ${DORK_POOL.length} pool) + free sources\n`);

    const [dorkHits, apiHits] = await Promise.all([
        runDorks(dorks),
        fetchAllSources(),
    ]);
    const rawAll = [...dorkHits, ...apiHits];
    console.log(`\n  ✓ Total raw scraped: ${rawAll.length} items`);

    // Save COMPLETE raw scrape (nothing lost) — committed to repo by the Action.
    writeJson(path.join(process.cwd(), 'data', `radar_raw_${today}.json`), rawAll);
    writeJson(path.join(process.cwd(), 'data', 'radar_raw_latest.json'), rawAll);

    // ── PHASE 2: Dedup against memory + cheap pre-filter ──────────────────────
    const seen = loadSeen();
    const unseenRaw = filterUnseen(rawAll, seen);
    const filtered = preFilter(unseenRaw);
    console.log(`\n🔎 Phase 2: ${rawAll.length} raw → ${unseenRaw.length} unseen → ${filtered.length} after pre-filter`);

    if (filtered.length === 0) {
        console.log('  Nothing new to analyze today.');
        const health = healthLine(dorks.length);
        await deliver([], today, health);
        return;
    }

    // ── PHASE 3: AI analyze in small batches ──────────────────────────────────
    const scored = await analyzeAll(filtered);
    const merged = mergeDuplicates(scored).sort((a, b) => (b.score || 0) - (a.score || 0));

    // Save final scored output.
    writeJson(path.join(process.cwd(), 'out', 'radar_items.json'), merged);

    // ── PHASE 4: Update memory + deliver ──────────────────────────────────────
    const nextSeen = updateSeen(merged.length ? merged : filtered, seen, today);
    saveSeen(nextSeen);

    const health = healthLine(dorks.length);
    await deliver(merged, today, health);

    console.log('\n✅ Personal Radar v2 complete!');
    console.log(`  Raw scraped:  ${rawAll.length}`);
    console.log(`  After dedup:  ${unseenRaw.length}`);
    console.log(`  Scored kept:  ${merged.length}`);
    console.log(`  ${health}\n`);
}

function healthLine(dorkCount) {
    const src = Object.entries(sourceStats).map(([k, v]) => `${k}${v.ok ? '✓' : '✗'}(${v.count})`).join(' ');
    const cse = `${PROVIDER} ${searchStats.ok}/${searchStats.attempted}${searchStats.quotaHit ? '⚠quota' : ''}`;
    const llm = `LLM ${llmStats.ok}/${llmStats.calls}(${llmStats.modelUsed})`;
    return `health: ${cse} · ${src} · ${llm}`;
}

run().catch(err => {
    console.error('Personal Radar failed:', err);
    process.exit(1);
});
