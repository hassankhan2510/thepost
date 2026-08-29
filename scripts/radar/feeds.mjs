/**
 * feeds.mjs — direct-source RSS connector layer ("our own thing", no search engine).
 *
 * Reads each target site's OWN public RSS feed. This is the reliable replacement for Google
 * dorks: no API keys, no quotas, no IP blocking, fully in our control. Confirmed working
 * 2026-08-26 (each returns 10+ fresh items).
 *
 * Opportunity/fellowship aggregators carry fellowships, grants, competitions, and many virtual
 * events/conferences globally — exactly what the CSE dorks were meant to find. Jobicy adds remote
 * jobs. The LLM analyzer then applies the geo/remote rules (online anywhere + physical-in-Pakistan
 * + global remote fellowships; reject foreign in-person events).
 */

import Parser from 'rss-parser';
import { CONFIG } from './config.mjs';

const rss = new Parser({ timeout: 12000 });
const sleep = ms => new Promise(r => setTimeout(r, ms));

export const feedStats = {};
function mark(name, count, ok) { feedStats[name] = { count, ok }; }

// Opportunity / fellowship / event aggregators (RSS). lane 'opp' — LLM assigns opp_category.
const OPP_FEEDS = [
    { name: 'OpportunityDesk', url: 'https://opportunitydesk.org/feed/' },
    { name: 'Opps4Youth', url: 'https://www.opportunitiesforyouth.org/feed/' },
    { name: 'Oyaop', url: 'https://www.oyaop.com/feed/' },
    { name: 'Mladiinfo', url: 'https://mladiinfo.eu/feed/' },
    { name: 'OppsForAfricans', url: 'https://www.opportunitiesforafricans.com/feed/' },
];

// Remote-job feeds (RSS). lane 'role'.
const JOB_FEEDS = [
    { name: 'Jobicy', url: 'https://jobicy.com/?feed=job_feed', group: 'ai_ml' },
];

async function pullFeed({ name, url, lane, group }) {
    try {
        const feed = await rss.parseURL(url);
        const items = (feed.items || []).slice(0, CONFIG.MAX_PER_SOURCE).map(it => ({
            source: `rss:${name}`,
            lane,
            group: group || 'fellowships',
            title: (it.title || '').slice(0, 160),
            url: it.link || it.guid || '',
            text: (it.contentSnippet || it.content || it.summary || '')
                .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 900),
        })).filter(x => x.title && x.url);
        mark(name, items.length, items.length > 0);
        return items;
    } catch (e) {
        mark(name, 0, false);
        return [];
    }
}

/** Pull all RSS connectors. Returns flat array of normalized raw items. */
export async function fetchAllFeeds() {
    console.log('📡 Fetching RSS connectors (opportunity aggregators + remote jobs)...');
    const all = [];
    // Sequential with small spacing — polite, and avoids one slow feed stalling a Promise.all.
    for (const f of OPP_FEEDS) { all.push(...await pullFeed({ ...f, lane: 'opp' })); await sleep(400); }
    for (const f of JOB_FEEDS) { all.push(...await pullFeed({ ...f, lane: 'role' })); await sleep(400); }
    console.log(`  ✓ RSS connectors: ${all.length} raw items`);
    return all;
}
