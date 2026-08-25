/**
 * sources.mjs — free, no-key, no-scraping-wall sources.
 *
 * These are the backbone of Lane B (real people posting real remote/founder roles):
 *   - Hacker News "Who is hiring / wants to be hired" via the Algolia API
 *   - RemoteOK, Remotive, Himalayas (JSON APIs)
 *   - We Work Remotely (RSS)
 *   - Reddit (public JSON): r/cofounder, r/startups, r/forhire, r/quant, ...
 *
 * Every fetch is wrapped so one dead source never breaks the run. Each source reports a
 * status into `sourceStats` for the Discord health line.
 */

import Parser from 'rss-parser';
import { CONFIG, SOURCES } from './config.mjs';

const rss = new Parser({ timeout: 15000 });
const UA = 'PersonalRadar/2.0 (personal job radar; contact alhassankhan2004@gmail.com)';
const sleep = ms => new Promise(r => setTimeout(r, ms));

export const sourceStats = {};
function mark(name, count, ok) { sourceStats[name] = { count, ok }; }

async function getJson(url, headers = {}) {
    const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'application/json', ...headers } });
    if (!res.ok) throw new Error(`${res.status}`);
    return res.json();
}

// ── Hacker News (Algolia) ─────────────────────────────────────────────────────
// The real goldmine: the monthly "Who is hiring?" and "Who wants to be hired?" threads.
// Each COMMENT is an individual job post. We pull the latest threads' comments and keep the
// remote ones, plus targeted searches for cofounder/founding-engineer language site-wide.
const REMOTE_HINT = /\b(remote|worldwide|anywhere|distributed|wfh|work from home)\b/i;

async function hnThreadComments(storyQuery, group, maxComments = 60) {
    const out = [];
    try {
        const sd = await getJson('https://hn.algolia.com/api/v1/search?tags=story&query=' + encodeURIComponent(storyQuery));
        const story = (sd.hits || []).find(h => /who is hiring|who wants to be hired|freelancer/i.test(h.title || ''));
        if (!story) return out;
        const cd = await getJson(`https://hn.algolia.com/api/v1/search?tags=comment,story_${story.objectID}&hitsPerPage=100`);
        for (const c of (cd.hits || [])) {
            const text = (c.comment_text || '').replace(/<[^>]+>/g, ' ').replace(/&#x2F;/g, '/').replace(/&#x27;/g, "'").replace(/\s+/g, ' ').trim();
            if (!text || text.length < 60) continue;
            if (!REMOTE_HINT.test(text)) continue; // remote-only
            out.push({
                source: 'hackernews',
                lane: 'role',
                group,
                title: `${story.title.replace(/\(.*?\)/, '').trim()} — ${text.slice(0, 60)}...`,
                url: `https://news.ycombinator.com/item?id=${c.objectID}`,
                text: text.slice(0, 900),
            });
            if (out.length >= maxComments) break;
        }
    } catch (e) { /* skip */ }
    return out;
}

async function fetchHN() {
    const out = [];
    // 1) The monthly hiring threads (comments = job posts).
    out.push(...await hnThreadComments('Ask HN: Who is hiring', 'ai_ml', 60));
    await sleep(CONFIG.API_DELAY_MS);
    out.push(...await hnThreadComments('Ask HN: Who wants to be hired', 'founder', 20));
    await sleep(CONFIG.API_DELAY_MS);
    // 2) Site-wide targeted searches for founder/cofounder language.
    for (const q of SOURCES.hnQueries) {
        try {
            const data = await getJson(SOURCES.hnAlgolia + encodeURIComponent(q));
            for (const hit of (data.hits || []).slice(0, 12)) {
                const text = (hit.comment_text || hit.story_text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                if (!text || text.length < 60) continue;
                if (!/cofounder|co-founder|founding|hiring|looking for/i.test(text)) continue;
                out.push({
                    source: 'hackernews',
                    lane: 'role',
                    group: 'founder',
                    title: (hit.story_title || text.slice(0, 60)).slice(0, 140),
                    url: hit.objectID ? `https://news.ycombinator.com/item?id=${hit.objectID}` : (hit.story_url || ''),
                    text: text.slice(0, 900),
                });
            }
        } catch (e) { /* skip */ }
        await sleep(CONFIG.API_DELAY_MS);
    }
    mark('HN', out.length, out.length > 0);
    return out;
}

// ── RemoteOK ──────────────────────────────────────────────────────────────────
async function fetchRemoteOK() {
    try {
        const data = await getJson(SOURCES.remoteok);
        const rows = Array.isArray(data) ? data.filter(r => r.position || r.title) : [];
        const out = rows.slice(0, CONFIG.MAX_PER_SOURCE).map(r => ({
            source: 'remoteok',
            lane: 'role',
            group: 'ai_ml',
            title: `${r.position || r.title} — ${r.company || ''}`.slice(0, 140),
            url: r.url || r.apply_url || '',
            text: `${(r.tags || []).join(', ')}. ${(r.description || '').replace(/<[^>]+>/g, ' ')}`.replace(/\s+/g, ' ').slice(0, 700),
        }));
        mark('RemoteOK', out.length, true);
        return out;
    } catch (e) { mark('RemoteOK', 0, false); return []; }
}

// ── Remotive ──────────────────────────────────────────────────────────────────
async function fetchRemotive() {
    const out = [];
    for (const q of SOURCES.remotiveQueries) {
        try {
            const data = await getJson(SOURCES.remotive + encodeURIComponent(q));
            for (const j of (data.jobs || []).slice(0, 15)) {
                out.push({
                    source: 'remotive',
                    lane: 'role',
                    group: 'ai_ml',
                    title: `${j.title} — ${j.company_name || ''}`.slice(0, 140),
                    url: j.url || '',
                    text: `${j.category || ''}. ${(j.description || '').replace(/<[^>]+>/g, ' ')}`.replace(/\s+/g, ' ').slice(0, 700),
                });
            }
        } catch (e) { /* skip */ }
        await sleep(CONFIG.API_DELAY_MS);
    }
    mark('Remotive', out.length, out.length > 0);
    return out;
}

// ── Himalayas ─────────────────────────────────────────────────────────────────
async function fetchHimalayas() {
    try {
        const data = await getJson(SOURCES.himalayas);
        const jobs = data.jobs || data.data || [];
        const out = jobs.slice(0, CONFIG.MAX_PER_SOURCE).map(j => ({
            source: 'himalayas',
            lane: 'role',
            group: 'ai_ml',
            title: `${j.title || ''} — ${j.companyName || j.company_name || ''}`.slice(0, 140),
            url: j.applicationLink || j.url || j.guid || '',
            text: `${(j.categories || []).join(', ')}. ${(j.description || '').replace(/<[^>]+>/g, ' ')}`.replace(/\s+/g, ' ').slice(0, 700),
        }));
        mark('Himalayas', out.length, true);
        return out;
    } catch (e) { mark('Himalayas', 0, false); return []; }
}

// ── We Work Remotely (RSS) ────────────────────────────────────────────────────
async function fetchWWR() {
    const out = [];
    for (const url of SOURCES.wwrRss) {
        try {
            const feed = await rss.parseURL(url);
            for (const it of (feed.items || []).slice(0, 20)) {
                out.push({
                    source: 'weworkremotely',
                    lane: 'role',
                    group: url.includes('product') ? 'product' : 'ai_ml',
                    title: (it.title || '').slice(0, 140),
                    url: it.link || '',
                    text: (it.contentSnippet || it.content || '').replace(/\s+/g, ' ').slice(0, 600),
                });
            }
        } catch (e) { /* skip */ }
        await sleep(CONFIG.API_DELAY_MS);
    }
    mark('WWR', out.length, out.length > 0);
    return out;
}

// ── Reddit (public JSON) ──────────────────────────────────────────────────────
async function fetchReddit() {
    const out = [];
    for (const { sub, q } of SOURCES.redditSubs) {
        try {
            const url = q
                ? `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(q)}&restrict_sr=1&sort=new&limit=25`
                : `https://www.reddit.com/r/${sub}/new.json?limit=25`;
            // Reddit blocks generic UAs; try a browser UA. Still best-effort — may 403 from some IPs.
            const data = await getJson(url, { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36' });
            for (const c of (data.data?.children || [])) {
                const p = c.data;
                const text = (p.selftext || p.title || '').replace(/\s+/g, ' ').trim();
                if (!text || text.length < 30) continue;
                out.push({
                    source: `reddit/${sub}`,
                    lane: 'role',
                    group: sub === 'quant' || sub === 'algotrading' ? 'quant' : 'founder',
                    title: (p.title || '').slice(0, 140),
                    url: `https://www.reddit.com${p.permalink}`,
                    text: text.slice(0, 800),
                });
            }
        } catch (e) { /* skip */ }
        await sleep(CONFIG.API_DELAY_MS);
    }
    mark('Reddit', out.length, out.length > 0);
    return out;
}

/**
 * Pull every free source. Returns a flat array of normalized raw items.
 */
export async function fetchAllSources() {
    console.log('📡 Fetching free structured sources (HN, RemoteOK, Remotive, Himalayas, WWR, Reddit)...');
    const results = await Promise.all([
        fetchHN(), fetchRemoteOK(), fetchRemotive(), fetchHimalayas(), fetchWWR(), fetchReddit(),
    ]);
    const flat = results.flat();
    console.log(`  ✓ Free sources: ${flat.length} raw items`);
    return flat;
}
