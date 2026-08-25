/**
 * discord.mjs — two-channel delivery + a health line so failures are never invisible.
 *
 * Roles brief   → DISCORD_ROLES_WEBHOOK  (falls back to DISCORD_RADAR_WEBHOOK)
 * Opportunities → DISCORD_RADAR_WEBHOOK
 */

import { ROLE_LANES, OPP_CATEGORIES } from './config.mjs';

const ROLES_WEBHOOK = process.env.DISCORD_ROLES_WEBHOOK || process.env.DISCORD_RADAR_WEBHOOK;
const OPP_WEBHOOK = process.env.DISCORD_RADAR_WEBHOOK;
const sleep = ms => new Promise(r => setTimeout(r, ms));

function fmtItem(it) {
    const star = it.score >= 5 ? '⭐ ' : '';
    const person = it.person_post ? ' · 🙋 direct' : '';
    const lines = [
        `> **${star}${it.name}** — _${it.org || 'unknown'}_${person}`,
        `> 📅 ${it.date || 'Check link'} | 📍 ${it.location || (it.remote ? 'Remote' : '—')}`,
    ];
    if (it.why_fit) lines.push(`> ${it.why_fit}`);
    if (it.url) lines.push(`> 🔗 ${it.url}`);
    return lines.join('\n');
}

function buildRolesBrief(items, today, health) {
    const roles = items.filter(i => i.kind === 'role');
    if (roles.length === 0) {
        return `🎯 **Roles for You — ${today}**\n${health}\n\nNo new matching remote roles in the last window. Scanning again tomorrow.`;
    }
    let out = `🎯 **Roles for You — ${today}**\n${health}\nFound **${roles.length}** new remote matches.\n`;
    for (const lane of ROLE_LANES) {
        const inLane = roles.filter(r => r.lane === lane.key).sort((a, b) => b.score - a.score);
        if (inLane.length === 0) continue;
        out += `\n${lane.emoji} **${lane.title}**  · _send ${lane.cv}_\n`;
        out += inLane.map(fmtItem).join('\n');
        out += '\n';
    }
    // roles whose lane didn't match any known key
    const other = roles.filter(r => !ROLE_LANES.find(l => l.key === r.lane));
    if (other.length) {
        out += `\n✨ **Other remote roles**\n` + other.sort((a, b) => b.score - a.score).map(fmtItem).join('\n') + '\n';
    }
    out += `\n_— Personal Radar · roles lane · daily_`;
    return out;
}

function buildOppBrief(items, today, health) {
    const opps = items.filter(i => i.kind === 'opp');
    if (opps.length === 0) {
        return `🌍 **Opportunities & Events — ${today}**\n${health}\n\nNo new opportunities or events in the last window.`;
    }
    let out = `🌍 **Opportunities & Events — ${today}**\n${health}\nFound **${opps.length}** new items.\n`;
    // critical first
    const crit = opps.filter(o => o.score >= 5).sort((a, b) => b.score - a.score);
    if (crit.length) out += `\n🔥 **CRITICAL — DON'T MISS**\n` + crit.map(fmtItem).join('\n') + '\n';
    for (const cat of OPP_CATEGORIES) {
        if (cat.key === 'critical') continue;
        const inCat = opps.filter(o => o.opp_category === cat.key && o.score < 5).sort((a, b) => b.score - a.score);
        if (inCat.length === 0) continue;
        out += `\n${cat.emoji} **${cat.title}**\n` + inCat.map(fmtItem).join('\n') + '\n';
    }
    out += `\n_— Personal Radar · opportunities lane · daily_`;
    return out;
}

async function send(webhook, name, text) {
    if (!webhook) { console.warn(`  ⚠ ${name} webhook not set — skipping`); return; }
    const LIMIT = 3900;
    const chunks = [];
    let remaining = text;
    while (remaining.length > 0) {
        if (remaining.length <= LIMIT) { chunks.push(remaining); break; }
        let cut = remaining.lastIndexOf('\n', LIMIT);
        if (cut === -1) cut = LIMIT;
        chunks.push(remaining.slice(0, cut));
        remaining = remaining.slice(cut).trim();
    }
    for (let i = 0; i < chunks.length; i++) {
        const payload = { username: '🎯 Personal Radar', embeds: [{ description: chunks[i], color: 0x38BDF8 }] };
        try {
            const res = await fetch(webhook, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
            });
            if (!res.ok) console.error(`  ✗ ${name} ${i + 1}/${chunks.length}: ${res.status} ${await res.text()}`);
            else console.log(`  ✓ ${name} ${i + 1}/${chunks.length} sent`);
        } catch (e) { console.error(`  ✗ ${name} send error: ${e.message}`); }
        if (i < chunks.length - 1) await sleep(1000);
    }
}

export async function deliver(items, today, health) {
    console.log('📨 Delivering to Discord (2 channels)...');
    await send(ROLES_WEBHOOK, 'roles', buildRolesBrief(items, today, health));
    await send(OPP_WEBHOOK, 'opportunities', buildOppBrief(items, today, health));
}

export { buildRolesBrief, buildOppBrief };
