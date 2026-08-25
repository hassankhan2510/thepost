/**
 * search.mjs — provider-agnostic web-search client (the Jina replacement).
 *
 * Google deprecated the "Search the entire web" toggle for Programmable Search, so we support
 * TWO backends and auto-pick whichever secret is present:
 *
 *   1. BRAVE  (recommended)  — real whole-web search, honors site:/OR/quotes.
 *        secret: BRAVE_API_KEY   (free tier ~2,000 queries/month)
 *   2. GOOGLE CSE (fallback) — free 100/day, but only searches the domains you configure in the
 *        engine (whole-web is deprecated). Site-scoped dorks still work; add our target domains.
 *        secrets: GOOGLE_CSE_KEY + GOOGLE_CSE_CX
 *
 * All failures are swallowed (returns []), and every call updates searchStats for the health line.
 */

import { CONFIG } from './config.mjs';

const BRAVE_KEY = process.env.BRAVE_API_KEY;
const CSE_KEY = process.env.GOOGLE_CSE_KEY;
const CSE_CX = process.env.GOOGLE_CSE_CX;

export const PROVIDER = BRAVE_KEY ? 'brave' : (CSE_KEY && CSE_CX ? 'google' : 'none');
export const searchStats = { provider: PROVIDER, attempted: 0, ok: 0, failed: 0, quotaHit: false };

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Map our DATE_RESTRICT (e.g. 'd7') to each provider's freshness param.
function braveFreshness(dr) {
    const n = Number((dr || '').replace(/\D/g, '')) || 7;
    if (n <= 1) return 'pd';
    if (n <= 7) return 'pw';
    return 'pm';
}

// ─── Brave ────────────────────────────────────────────────────────────────────
async function braveSearch(query, dateRestrict) {
    const url = new URL('https://api.search.brave.com/res/v1/web/search');
    url.searchParams.set('q', query);
    url.searchParams.set('count', String(Math.min(CONFIG.MAX_PER_QUERY, 20)));
    url.searchParams.set('freshness', braveFreshness(dateRestrict));
    const res = await fetch(url, {
        headers: { 'Accept': 'application/json', 'X-Subscription-Token': BRAVE_KEY },
    });
    if (res.status === 429) { searchStats.quotaHit = true; throw new Error('429 rate/quota'); }
    if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 120)}`);
    const data = await res.json();
    return (data.web?.results || []).map(it => ({
        source: 'search', title: it.title || '',
        url: it.url || '', text: (it.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    }));
}

// ─── Google CSE ───────────────────────────────────────────────────────────────
async function googleSearch(query, dateRestrict) {
    const url = new URL('https://www.googleapis.com/customsearch/v1');
    url.searchParams.set('key', CSE_KEY);
    url.searchParams.set('cx', CSE_CX);
    url.searchParams.set('q', query);
    url.searchParams.set('num', String(Math.min(CONFIG.MAX_PER_QUERY, 10)));
    if (dateRestrict) url.searchParams.set('dateRestrict', dateRestrict);
    const res = await fetch(url);
    if (res.status === 429) { searchStats.quotaHit = true; throw new Error('429 quota'); }
    if (!res.ok) {
        const body = await res.text();
        if (/dailyLimitExceeded|quotaExceeded/.test(body)) searchStats.quotaHit = true;
        throw new Error(`${res.status} ${body.slice(0, 120)}`);
    }
    const data = await res.json();
    return (data.items || []).map(it => ({
        source: 'search', title: it.title || '',
        url: it.link || '', text: (it.snippet || '').replace(/\s+/g, ' ').trim(),
    }));
}

/** Run one dork query with the active provider. Returns [] on any failure. */
export async function webSearch(query, dateRestrict = CONFIG.DATE_RESTRICT) {
    if (PROVIDER === 'none') return [];
    if (searchStats.quotaHit) return [];
    searchStats.attempted++;
    try {
        const hits = PROVIDER === 'brave'
            ? await braveSearch(query, dateRestrict)
            : await googleSearch(query, dateRestrict);
        searchStats.ok++;
        return hits.map(h => ({ ...h, query: query.slice(0, 80) }));
    } catch (err) {
        searchStats.failed++;
        console.warn(`    ⚠ ${PROVIDER} search "${query.slice(0, 45)}": ${err.message}`);
        return [];
    }
}

/** Run a batch of dork objects ({ q, lane, group }) with provider-appropriate spacing. */
export async function runDorks(dorks) {
    if (PROVIDER === 'none') {
        console.warn('  ⚠ No search backend configured (set BRAVE_API_KEY or GOOGLE_CSE_KEY+GOOGLE_CSE_CX) — running free sources only.');
        return [];
    }
    console.log(`  search provider: ${PROVIDER}`);
    const delay = PROVIDER === 'brave' ? 1100 : CONFIG.CSE_DELAY_MS; // Brave free tier = 1 req/sec
    const results = [];
    for (let i = 0; i < dorks.length; i++) {
        const d = dorks[i];
        process.stdout.write(`  [${i + 1}/${dorks.length}] dork(${d.group}): ${d.q.slice(0, 50)}...\r`);
        const hits = await webSearch(d.q);
        for (const h of hits) results.push({ ...h, lane: d.lane, group: d.group });
        if (searchStats.quotaHit) { console.warn('\n  ⚠ quota hit — halting dorks'); break; }
        await sleep(delay);
    }
    console.log(`\n  ✓ ${PROVIDER}: ${searchStats.ok}/${searchStats.attempted} ok, ${results.length} raw hits`);
    return results;
}
