/**
 * config.mjs — Personal Radar v2 configuration
 *
 * Single source of truth for: Hassan's profile, the 7 role lanes, source endpoints,
 * and all tunables. Edit this file to change behaviour — no need to touch logic.
 */

// ─── Tunables ─────────────────────────────────────────────────────────────────
export const CONFIG = {
    // How many Google CSE dork queries to run per daily run (free tier = 100/day).
    DAILY_DORK_COUNT: Number(process.env.RADAR_DORK_COUNT || 45),

    // Date window for freshness. Google CSE uses dateRestrict (d=days). Kept modest so
    // events indexed a day or two late are still caught. Real de-duplication is done by
    // data/radar_seen.json, NOT by an aggressive date filter.
    DATE_RESTRICT: process.env.RADAR_DATE_RESTRICT || 'd7', // last 7 days

    // How many days to remember an item so it is never shown twice.
    SEEN_TTL_DAYS: 30,

    // LLM batching — small batches so nothing gets dropped in one giant response.
    ANALYZE_BATCH_SIZE: 6,

    // Delays (ms) to stay inside rate limits.
    CSE_DELAY_MS: 600,
    API_DELAY_MS: 1200,
    LLM_DELAY_MS: 4000,

    // Max results to keep per CSE query and per free-API source.
    MAX_PER_QUERY: 10,
    MAX_PER_SOURCE: 40,

    // LLM model — Hassan confirmed 'openrouter/free' works. Fallbacks used only if it errors.
    LLM_MODEL: process.env.RADAR_LLM_MODEL || 'openrouter/free',
    LLM_FALLBACKS: [
        'deepseek/deepseek-chat-v3-0324:free',
        'meta-llama/llama-3.3-70b-instruct:free',
        'google/gemini-2.0-flash-exp:free',
    ],
};

// ─── Hassan's profile (fed to the LLM for scoring/fit) ────────────────────────
export const PROFILE = `
Hassan Khan — Islamabad, Pakistan. Works REMOTE ONLY (cannot relocate right now; can work odd/US hours).
Final-year BS Computer Science at NUTECH (graduating ~mid-2027). Currently Projects Lead at Nexaura,
leading a remote team shipping enterprise AI (AI clinical scribe; call-QA platform, ~15k calls/month)
for Government of Pakistan clients. Ex co-founder/CTO of AmnaAman.

Legally blind / low vision (ocular albinism) — builds assistive/vision tech from lived experience.
This is a genuine, least-crowded advantage for disability-tech and social-impact opportunities.

Real shipped/built work: AlbiSight (differentiable computational optics, PyTorch), MineGuard
(federated edge ML), Morphogenetic Network (custom CUDA/C++ neural engine), GDL sovereign-default,
PhononicArmor (inverse-designed metamaterials), NarrativeEngine (AI video pipeline, Remotion).
Quant work: TFT+MDN regime prediction, RL trading agent, market-microstructure papers (backtests).

Skills: Python, C++, CUDA, PyTorch, TypeScript/React, Node.js; NLP/STT, computer vision, edge ML,
federated learning, quantitative modelling, automation/CI-CD, technical leadership.
`.trim();

// ─── The 7 role lanes (Lane B) + opportunity categories (Lane A) ──────────────
// Each role lane maps to a CV in ../admission/ so applying is one step away.
export const ROLE_LANES = [
    { key: 'founder',    emoji: '🚀', title: 'Founder / Cofounder / Founding eng', cv: 'cv_professional.md',
      match: 'looking for a cofounder, technical cofounder, founding engineer, founding PM, first hire, join an early team' },
    { key: 'ai_ml',      emoji: '🧠', title: 'AI / ML Research & Engineering', cv: 'cv_ai_research_jobs.md',
      match: 'AI research engineer, ML engineer, applied scientist, research assistant/associate, edge/CV/optics ML' },
    { key: 'quant',      emoji: '💹', title: 'Quant / Algo / Fintech', cv: 'cv_quant_finance.md',
      match: 'quant developer, algo trading engineer, quant researcher, fintech ML, market microstructure' },
    { key: 'product',    emoji: '📦', title: 'Product / Project / Program lead', cv: 'cv_product_manager.md',
      match: 'associate PM, technical PM, product lead, project lead, program/delivery manager' },
    { key: 'automation', emoji: '⚙️', title: 'Automation / Systems engineering', cv: 'cv_ai_research_jobs.md',
      match: 'automation engineer, workflow/RPA, AI automation, integrations, platform/systems engineering' },
    { key: 'media',      emoji: '🎬', title: 'AI Media / Content automation', cv: 'cv_media_engineer.md',
      match: 'creative technologist, media automation, generative-media engineer, video pipeline' },
    { key: 'fellowship', emoji: '🎓', title: 'Fellowships / Social-impact / Changemaker', cv: 'cv_fellowship.md',
      match: 'disability-tech, assistive tech, global-south youth fellowship, social enterprise, UN/ITU programs' },
];

export const OPP_CATEGORIES = [
    { key: 'critical',    emoji: '🔥', title: "CRITICAL — DON'T MISS" },
    { key: 'events_pk',   emoji: '🇵🇰', title: 'Pakistan / Virtual events' },
    { key: 'fellowships', emoji: '🎓', title: 'Fellowships & grants' },
    { key: 'accelerator', emoji: '🚀', title: 'Accelerators & incubators' },
    { key: 'hackathon',   emoji: '🏆', title: 'Hackathons & competitions' },
    { key: 'conference',  emoji: '🌍', title: 'Conferences & summits' },
];

// ─── Free source endpoints (no key, no scraping walls) ────────────────────────
export const SOURCES = {
    // Hacker News "Who is hiring / who wants to be hired" and freeform hiring comments.
    hnAlgolia: 'https://hn.algolia.com/api/v1/search_by_date?tags=comment&query=',
    remoteok: 'https://remoteok.com/api',
    remotive: 'https://remotive.com/api/remote-jobs?limit=80&search=',
    himalayas: 'https://himalayas.app/jobs/api?limit=50',
    // We Work Remotely category RSS.
    wwrRss: [
        'https://weworkremotely.com/categories/remote-programming-jobs.rss',
        'https://weworkremotely.com/categories/remote-devops-sysadmin-jobs.rss',
        'https://weworkremotely.com/categories/remote-product-jobs.rss',
    ],
    // Reddit subs (public JSON). Person-posted cofounder/hiring signals live here.
    redditSubs: [
        { sub: 'cofounder', q: '' },
        { sub: 'startups', q: 'hiring' },
        { sub: 'forhire', q: 'Hiring' },
        { sub: 'remotejs', q: '' },
        { sub: 'MachineLearning', q: 'hiring' },
        { sub: 'quant', q: 'hiring' },
        { sub: 'algotrading', q: 'hiring' },
    ],
    // Site-wide HN comment searches for person-posted founder language (thread mining is separate).
    hnQueries: ['cofounder', 'founding engineer', 'technical cofounder'],
    // Search terms we push into Remotive.
    remotiveQueries: ['machine learning', 'ai', 'automation', 'python', 'product manager'],
};
