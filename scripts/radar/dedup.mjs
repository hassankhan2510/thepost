/**
 * dedup.mjs — persistent "seen" memory so nothing is shown twice.
 *
 * This REPLACES the aggressive `after:yesterday` filter as the anti-duplication mechanism.
 * We can now use a wider freshness window (so late-indexed events are caught) while still
 * never repeating an item. State lives in data/radar_seen.json and is committed back to the
 * repo by the GitHub Action.
 */

import fs from 'fs';
import path from 'path';
import { CONFIG } from './config.mjs';

const SEEN_FILE = path.join(process.cwd(), 'data', 'radar_seen.json');

function keyFor(item) {
    // Normalize a URL/name into a stable dedup key.
    const u = (item.url || '').toLowerCase().replace(/[#?].*$/, '').replace(/\/$/, '');
    if (u) return u;
    return `${(item.name || item.title || '').toLowerCase().trim()}::${(item.org || '').toLowerCase().trim()}`;
}

export function loadSeen() {
    try {
        if (fs.existsSync(SEEN_FILE)) return JSON.parse(fs.readFileSync(SEEN_FILE, 'utf-8'));
    } catch (e) { /* corrupt file → start fresh */ }
    return {};
}

/** Remove items already seen (within TTL). Returns fresh items only. */
export function filterUnseen(items, seen) {
    return items.filter(it => {
        const k = keyFor(it);
        return !seen[k];
    });
}

/** Record shown items and prune entries older than TTL. Returns updated seen map. */
export function updateSeen(items, seen, todayIso) {
    const cutoff = Date.now() - CONFIG.SEEN_TTL_DAYS * 24 * 3600 * 1000;
    const next = {};
    // keep recent existing entries
    for (const [k, ts] of Object.entries(seen)) {
        if (new Date(ts).getTime() >= cutoff) next[k] = ts;
    }
    // add today's
    for (const it of items) next[keyFor(it)] = todayIso;
    return next;
}

export function saveSeen(seen) {
    const dir = path.dirname(SEEN_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SEEN_FILE, JSON.stringify(seen, null, 2), 'utf-8');
}

/** Merge duplicate items (same key) that came from different sources, keeping highest score. */
export function mergeDuplicates(items) {
    const map = new Map();
    for (const it of items) {
        const k = keyFor(it);
        const existing = map.get(k);
        if (!existing || (it.score || 0) > (existing.score || 0)) map.set(k, it);
    }
    return [...map.values()];
}
