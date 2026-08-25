# Personal Radar v2 — Implementation Plan & Build

*Owner: Hassan Khan · Drafted: 2026-08-23 · Status: **BUILT — needs 3 secrets to go live***
*Lives in: `CohortZero_Daily_Run/` · Ships as: `scripts/personal_radar.mjs` + `scripts/radar/*` + `.github/workflows/personal_radar.yml`*

This is the honest, buildable plan for fixing the current Opportunity Radar **and** adding a second
lane that hunts for *your specific remote roles and founder/cofounder posts* — not generic, saturated
job-board listings. It is written to be realistic. Where something is hard or won't work, it says so.

---

## ✅ STATUS: BUILT — what shipped (2026-08-23)

The full v2 system is written and the free half is tested end-to-end (**252 real items pulled with
zero API keys, zero Jina** — HN monthly-thread mining, RemoteOK, Remotive, Himalayas, We Work Remotely).
Decisions you locked: **strictly-free stack**, keep `openrouter/free`, dedup-based anti-duplication,
**two Discord channels**, comprehensive job dorks, multi-batch LLM, push all data to GitHub.

**Files:**
- `scripts/personal_radar.mjs` — orchestrator (collect → dedup → analyze → deliver → commit)
- `scripts/radar/config.mjs` — profile, 7 role lanes, tunables, source endpoints
- `scripts/radar/dorks.mjs` — **103-dork pool** (61 role + 42 opportunity), 45 sampled/day, rotating
- `scripts/radar/search.mjs` — Google Programmable Search client (the Jina replacement)
- `scripts/radar/sources.mjs` — free APIs: HN Algolia, RemoteOK, Remotive, Himalayas, WWR, Reddit
- `scripts/radar/intel.mjs` — LLM extract+classify+score in small batches, with model fallback
- `scripts/radar/dedup.mjs` — `data/radar_seen.json` (30-day memory; the real anti-duplication)
- `scripts/radar/discord.mjs` — two-channel delivery + health line
- `.github/workflows/personal_radar.yml` — daily at 8 AM PKT, commits data back, posts to Discord

**Run manually:** `npm run radar:v2`

### 🔧 SETUP — do this once to go live (~10 min)

> **Search-backend note (important):** Google deprecated the "Search the entire web" toggle in
> Programmable Search. So the dork engine now supports TWO backends — pick ONE. The code auto-detects
> which secret you set.

**1. Search backend — choose ONE:**

- **Option A — Brave Search API (recommended: real whole-web search):**
  - Sign up at <https://api.search.brave.com/app/keys>, create a key (free tier ~2,000 queries/month
    ≈ 66/day, covers our 45/day). Signup may ask for a card to verify — the free tier is $0.
  - Secret: `BRAVE_API_KEY`.
- **Option B — Google CSE, domain-restricted (fully free, no card):**
  - Create an engine at <https://programmablesearchengine.google.com/>. When it asks for a site to
    search, add the target domains listed below (Settings → "Sites to search"). Leave whole-web OFF
    (it's deprecated). Copy the **Search engine ID** → `GOOGLE_CSE_CX`.
  - Enable the **Custom Search API** at
    <https://console.cloud.google.com/apis/library/customsearch.googleapis.com> and make an **API key**
    → `GOOGLE_CSE_KEY`.
  - **Domains to add** (paste into "Add sites to include", one per line, entire-domain form; 38 of the
    richest active sources — under the 50 limit; scholarships deferred to phase 2):
    ```
    *.linkedin.com
    *.lu.ma
    *.eventbrite.com
    *.meetup.com
    *.allevents.in
    *.10times.com
    *.f6s.com
    *.devpost.com
    *.wellfound.com
    *.ycombinator.com
    *.workatastartup.com
    *.indiehackers.com
    *.reddit.com
    *.remoteok.com
    *.remotive.com
    *.weworkremotely.com
    *.himalayas.app
    *.builtin.com
    *.lever.co
    *.greenhouse.io
    *.ashbyhq.com
    *.efinancialcareers.com
    *.opportunitydesk.org
    *.youthop.com
    *.opportunitiesforyouth.org
    *.oneyoungworld.com
    *.solve.mit.edu
    *.hello-tomorrow.org
    *.startupschool.org
    *.techstars.com
    *.antler.co
    *.seedstars.com
    *.unv.org
    *.undp.org
    *.techjuice.pk
    *.propakistani.pk
    *.pakwired.com
    *.nicpakistan.pk
    ```
  - *Tradeoff:* great for events + job boards + cofounder posts on those sites, but **won't discover
    brand-new fellowships from unknown orgs** across the open web. If open-web discovery matters to
    you, use Option A.

**2. Second Discord webhook** (roles channel): Discord → Server Settings → Integrations → Webhooks →
New Webhook → pick a #roles channel → Copy URL → `DISCORD_ROLES_WEBHOOK`. (Skip it and roles post to
your existing `DISCORD_RADAR_WEBHOOK`.)

**3. Add repo secrets** (GitHub → repo → Settings → Secrets and variables → Actions): your chosen
search secret(s) + `DISCORD_ROLES_WEBHOOK`. `OPENROUTER_API_KEY` and `DISCORD_RADAR_WEBHOOK` exist.

**4. Turn it on:** runs daily automatically, or trigger "🎯 Personal Radar v2" manually from the
Actions tab. **It works with no search backend at all** — it just runs the free APIs only (~250
items/day). The backend adds targeted dork coverage (Pakistan events, cofounder posts, fellowships).

> **Reddit note:** Reddit now returns 403 to unauthenticated requests, so that source is best-effort
> and will show ✗ in the health line. Everything else is green. If you want Reddit later, register a
> free Reddit "script" app for OAuth and we'll wire it in.

---

## 0. TL;DR — what changes and why

| | Radar v1 (now) | Radar v2 (this plan) |
|---|---|---|
| Search engine | Jina `s.jina.ai` (ignores Google dork operators) | Google Programmable Search (free, real operators) + free APIs |
| Dorks | 44 written, but **don't actually run as dorks** | 30–50 real dorks/day, rotated across a pool of ~120 |
| Freshness | `after:yesterday` → near-zero LinkedIn hits | `after:` window of 3–7 days + date parsing in filter |
| Reader | Jina `r.jina.ai` (blocked on LinkedIn) | Serper + native RSS/JSON APIs (no scraping walls) |
| LLM | `openrouter/free` (invalid ID → silent fails) | A real pinned model ID, with fallback + hard logging |
| Lanes | 1 (opportunities) | 2 (opportunities **+** jobs/gigs/cofounder) |
| Job focus | none | 7 role lanes mapped to your 7 CVs, remote-only |
| "Person is hiring" | none | Explicit detection of first-person founder posts |
| De-dup memory | none (re-shows same items) | Persistent `seen.json`, 30-day dedup |
| Failure visibility | silent | per-source counters + a "health" line in Discord |

**The one-sentence diagnosis of "it misses Pakistan events":** the dorks were never really run as
Google dorks. Jina's search endpoint quietly drops `site:`, nested `OR`, and `after:` operators, so
every query collapsed into a fuzzy keyword search — and `after:yesterday` on `linkedin.com/posts`
(which Google barely indexes within 24h) returned almost nothing. Fixing the search backend fixes the
Pakistan-events problem at the root.

---

## 1. Root-cause analysis of Radar v1 (so we don't repeat it)

Read this before touching code. Each of these is a real, verifiable failure in
`scripts/opportunity_radar.mjs`:

1. **Jina search ≠ Google dorks.** `s.jina.ai/{query}` runs Jina's own web search. It does not
   reliably honor `site:`, `after:YYYY-MM-DD`, or nested `("a" OR "b")` grouping. So all 44 dorks
   degraded into loose keyword matches. **This is the primary cause of missed PK events.**
2. **`after:${getYesterday()}` is too tight.** Real event/meetup posts are indexed days later, not
   within 24h. LinkedIn posts specifically are poorly indexed by Google at all. Use a rolling 3–7 day
   window and do the real "is it still open / in the future?" check in the LLM filter, not the query.
3. **`model: 'openrouter/free'` is not a valid model ID.** OpenRouter needs a concrete slug
   (e.g. `deepseek/deepseek-chat`, `meta-llama/llama-3.3-70b-instruct`, or a `:free` variant). When
   the call fails, the code returns `null` and silently drops the batch — so even good raw results
   vanish. **No error ever reached you.**
4. **LinkedIn `/posts` is the wrong primary channel.** It needs auth, is anti-scraping, and is thinly
   Google-indexed. Betting 30+ of 44 dorks on `site:linkedin.com/posts` guarantees low yield. Keep a
   few LinkedIn dorks, but move the weight to sources that are actually readable (below).
5. **Aggressive truncation.** 6 results × 500 chars, batches of 10, into a small free model. Signal
   gets cut before the filter sees it.
6. **No persistent memory.** Nothing stops the same item reappearing daily; nothing records which
   source produced hits, so you can't tell what's working.

**Design principle for v2:** *sources you can actually read > clever dorks against walls.* Prefer
open RSS/JSON APIs; use SERP dorks as a supplement, not the foundation.

---

## 2. What v2 must do (requirements, from your brief)

- **Lane A — Opportunities** (fix the existing radar): fellowships, virtual incubators, grants,
  global-changemaker programs, hackathons, and **Pakistan/virtual events** (summits, webinars,
  meetups) that v1 misses.
- **Lane B — Roles for you** (new): remote roles and founder/cofounder posts matching your CVs.
  Specifically **remote-only** (you work from Pakistan), and biased toward *a real person looking for
  a person* — "I'm looking for a cofounder / founder / project lead / we're hiring a…" — **not**
  the LinkedIn "Easy Apply" listings that get 200–300 applicants an hour.
- **Scale:** 30–50 searches/day, within rate limits, on free/cheap infra (GitHub Actions).
- **No Jina.** Use a real SERP API + free structured feeds.
- **Delivery:** categorized Discord brief, once daily, deduped against history.

---

## 3. Your role taxonomy (Lane B) — mapped to your 7 CVs

These are the seven lanes we search for. Each maps to a CV in `admission/` so an application is one
step away. Every lane is **remote-only**.

| # | Lane | Titles / signals to match | CV to send |
|---|---|---|---|
| 1 | **AI / ML Research & Engineering** | AI research engineer, ML engineer, applied scientist, research assistant/associate, edge/CV/optics ML | `cv_ai_research_jobs.md` / `cv_academic.md` |
| 2 | **Quant / Algo / Fintech** | quant developer, algo trading engineer, quant researcher, fintech ML, market-microstructure | `cv_quant_finance.md` |
| 3 | **Product / Project / Program lead** | associate PM, technical PM, product lead, project lead, program manager, delivery lead | `cv_product_manager.md` |
| 4 | **Automation / Systems engineering** | automation engineer, workflow/RPA, AI automation, integrations, platform/systems eng | `cv_ai_research_jobs.md` / `cv_media_engineer.md` |
| 5 | **AI Media / Content automation** | creative-tech engineer, media automation, video pipeline, generative-media eng | `cv_media_engineer.md` |
| 6 | **Fellowships / Social-impact / Changemaker** | disability-tech, global-South youth fellowships, social-enterprise, UN/ITU programs | `cv_fellowship.md` |
| 7 | **Founder / Cofounder / Founding engineer** | "looking for a cofounder", founding engineer, founding PM, technical cofounder, first hire | `cv_professional.md` |

> Realism note: your **unfair advantages** (legally blind, building blindness/low-vision tech;
> global-South technologist) are strongest in Lane 6 and worth weighting up in scoring. Lanes 1–5 are
> competitive; the edge there is *remote + real shipped work + willingness to start small*.

---

## 4. Source strategy — where these things ACTUALLY live

This is the core of v2. Grouped by how reliably we can read them (free, no wall) → (needs key) →
(hard/scraping). **We build outward from the reliable ones.**

### 4.1 Tier 1 — free, structured, no scraping (build these FIRST)

These give the highest signal for the least effort and are Jina-free by nature.

- **Hacker News "Who is hiring?" / "Who wants to be hired?"** — monthly threads, *full of remote &
  founding-engineer posts written by real people.* Free via **HN Algolia API**
  (`http://hn.algolia.com/api/v1/search?tags=comment&query=remote`). No key. **Best single source for
  Lane B.**
- **Remote job APIs / RSS (free, no key):**
  - RemoteOK: `https://remoteok.com/api` (JSON)
  - Remotive: `https://remotive.com/api/remote-jobs?search=...` (JSON)
  - We Work Remotely: category RSS feeds (`https://weworkremotely.com/categories/remote-programming-jobs.rss`)
  - Himalayas: `https://himalayas.app/jobs/api` (JSON)
  - Hnhiring / hiring.cafe style mirrors (optional)
- **Reddit JSON (free, no key for read):** `https://www.reddit.com/r/{sub}/new.json?limit=50` over
  `r/cofounder`, `r/startups`, `r/forhire` (search "hiring"), `r/remotejs`, `r/RemoteWork`,
  `r/MachineLearning` (the monthly "Who's hiring"), `r/quant`, `r/algotrading`. Set a real
  `User-Agent`. This is a strong source for *person-posted* cofounder/hiring signals.
- **Wellfound / YC Work-at-a-Startup:** startup + founding roles. Wellfound has no clean public API;
  read via SERP dorks (Tier 2) or their RSS where available. YC's job board is SERP-dorkable.
- **Event sources for Lane A (fixes PK-events gap):**
  - **Luma (lu.ma)** — where most virtual + PK tech events now live. Discover-page + SERP dorks.
  - **Eventbrite** — has a discovery API (key) and dorkable pages; filter to Pakistan + Online.
  - **Meetup** — GraphQL API (needs OAuth) or SERP dorks on `meetup.com` PK/virtual groups.
  - **TechJuice / ProPakistani / PakWired** — already in your RSS list; add their event tags.
  - University / ecosystem pages: NIC, Plan9, i2i, PSEB, NUST/LUMS event pages via direct reads.

### 4.2 Tier 2 — real SERP dorks (the Jina replacement)

Use a **real Google SERP API** so `site:`, `after:`, and `OR` groups actually work. Recommended:
**Serper.dev** (Google results, ~2,500 free credits then cheap, supports operators, returns clean
JSON). Alternatives: Google Programmable Search JSON API (100/day free), Brave Search API (free tier),
or a self-hosted **SearXNG** instance (free, unlimited-ish, but you maintain it).

This is where the 30–50 dorks/day run. Dorks now *actually* target the right surfaces:
- `site:ycombinator.com/companies "founding engineer" remote`
- `site:wellfound.com (cofounder OR "founding") remote (AI OR ML)`
- `("looking for a cofounder" OR "seeking a technical cofounder") (AI OR ML OR fintech) after:{window}`
- `site:lu.ma (Pakistan OR Islamabad OR virtual OR online) (AI OR startup OR summit OR webinar) after:{window}`
- `site:eventbrite.com (Pakistan OR Islamabad OR online) (AI OR tech OR startup) after:{window}`
- `(fellowship OR grant) ("disability" OR "low vision" OR "assistive tech") "apply" after:{window}`
- …and lane-specific variants (see §6).

### 4.3 Tier 3 — hard / low-yield (keep minimal, set expectations)

- **LinkedIn posts** — gated, anti-scraping, thinly indexed. Keep ~3–5 dorks for it, expect low hits,
  never make it the backbone. (This is the honest reason v1 felt empty.)
- **X / Twitter** — the API is now paid and restrictive; nitter instances are unreliable. Treat X as
  *optional/experimental*; if you want it, budget for a paid API or accept flaky nitter scraping.
  Do **not** build core coverage on X.

---

## 5. Architecture

One script, two lanes, shared plumbing. Runs on GitHub Actions once/day.

```
personal_radar.mjs
├── config/
│   ├── sources.mjs        # Tier-1 API endpoints + RSS list
│   ├── dorks.mjs          # ~120 dorks tagged by lane; 30–50 sampled per run
│   └── profile.mjs        # Hassan profile + role taxonomy + remote-only rules
├── fetch/
│   ├── serper.mjs         # SERP API client (rate-limited, retries)
│   ├── apis.mjs           # HN Algolia, RemoteOK, Remotive, Reddit, Himalayas, WWR RSS
│   └── events.mjs         # Luma / Eventbrite / Meetup / PK ecosystem reads
├── intel/
│   ├── extract.mjs        # Phase 2A — raw → structured items (LLM, batched)
│   ├── classify.mjs       # lane detection + remote check + person-post check
│   ├── score.mjs          # relevance 1–5 + saturation penalty
│   └── dedup.mjs          # merge + check against data/radar_seen.json
├── deliver/
│   └── discord.mjs        # categorized brief + health line
└── run.mjs                # orchestrates, writes out/ + data/radar_seen.json
```

### 5.1 Pipeline (per daily run)

1. **Collect (Tier 1 first, then Tier 2):**
   - Pull all free APIs/RSS (HN, RemoteOK, Remotive, Reddit, Himalayas, WWR, event sources).
   - Sample 30–50 dorks from the pool (rotating so all ~120 get covered over ~3 days) and run them
     through Serper with rate limiting.
2. **Normalize:** every raw hit → `{source, url, title, text, date?, lane_hint}`.
3. **Pre-filter (cheap, no LLM):** drop items already in `radar_seen.json`; drop obvious non-remote
   ("onsite", "hybrid in <non-PK city>") for Lane B; drop past-dated events for Lane A.
4. **Extract (LLM, batched):** raw text → structured opportunity/role objects.
5. **Classify (LLM or rules):**
   - Assign to one of 7 role lanes or an opportunity category.
   - **Remote check:** is it remote / remote-friendly / global / virtual? If clearly onsite outside
     Pakistan → reject.
   - **Person-post check (Lane B):** is this *a person looking for a person* (founder/cofounder/small
     team hiring directly) vs a saturated corporate listing? Boost the former.
6. **Score 1–5 + saturation penalty:** perfect-fit remote founding/AI role or disability fellowship =
   5; generic mega-corp listing with 500 applicants = penalized down.
7. **Dedup + rank:** merge same item across sources; sort by score.
8. **Deliver:** categorized Discord brief; append shown items to `radar_seen.json`; commit it back.

### 5.2 Intelligence detail — the "real person, not a job board" filter

This is what makes it *your* radar and not a scraper. The classifier prompt gets your full profile
(from `profile.mjs`) and these rules:

- **Prefer** first-person / small-team language: "I'm looking for", "we're a 3-person team",
  "founding engineer", "join as cofounder", "early hire", "reach out to me directly".
- **Penalize** saturation signals: "Easy Apply", ">100 applicants", big-corp ATS links, reposted
  aggregator listings, closed/expired dates.
- **Hard remote gate:** accept `remote / remote-first / worldwide / virtual / async`; reject
  onsite-only outside Pakistan. Timezone note: flag US-only-hours roles as "TZ risk" but don't
  auto-reject (you can work odd hours).
- **Fit reasoning:** each surfaced item gets one line — *why it fits you and which CV to send.*

---

## 6. The dork pool (design, not final text)

Store ~120 dorks in `config/dorks.mjs`, each tagged `{lane, tier, weight}`. Each run samples 30–50
weighted by lane priority, rotating by day-of-year so the whole pool is covered every ~3 days. The
`{window}` token expands to `after:<today-7d>` (tunable).

**Per-lane seed groups (expand each to ~15 dorks):**
- **Founder/Cofounder:** `"looking for a cofounder"`, `"seeking technical cofounder"`,
  `"founding engineer" remote`, `site:ycombinator.com/companies "founding"`, `site:wellfound.com`…
- **AI/ML roles:** `"remote" ("ML engineer" OR "AI research") ("apply" OR "we're hiring")`,
  `site:remoteok.com ai`, `site:remotive.com machine-learning`…
- **Quant/Algo:** `("quant developer" OR "algo trading") remote`, `site:reddit.com/r/quant hiring`…
- **Product/Project lead:** `("product manager" OR "project lead") remote startup`…
- **Automation/Systems:** `("automation engineer" OR "workflow automation") remote`…
- **AI Media:** `("creative technologist" OR "media automation") remote`…
- **Fellowship/Impact:** `(fellowship OR grant) ("disability" OR "assistive" OR "global south") apply`,
  `site:lu.ma social impact`…
- **PK / Virtual events (Lane A fix):** `site:lu.ma Pakistan`, `site:eventbrite.com Islamabad online`,
  `site:meetup.com Pakistan tech`, `("webinar" OR "summit") Pakistan after:{window}`…

---

## 7. Rate limits & scheduling

- **Serper.dev:** batch dorks with a small delay (e.g. 1–2 concurrent, ~1s spacing). 30–50 calls/day
  is comfortably inside free/cheap tiers. Track a per-run credit counter; hard-stop at a cap.
- **Free APIs:** HN Algolia, Reddit, RemoteOK etc. — space requests ~1–2s, set a real `User-Agent`,
  handle 429 with backoff. Reddit especially: respect `User-Agent` or you get blocked.
- **OpenRouter LLM:** pin a real model; batch extraction (≤10 items/call); ~3–5s between calls; log
  every non-200 loudly (this was invisible in v1).
- **GitHub Actions:** one scheduled run/day (`cron`), `timeout-minutes: 60`, `workflow_dispatch` for
  manual runs. Commit `data/radar_seen.json` back like `daily_run.yml` already does for history.

---

## 8. Config & secrets

Add to repo secrets (GitHub → Settings → Secrets):
- `OPENROUTER_API_KEY` (exists)
- `DISCORD_RADAR_WEBHOOK` (exists) — or a new one for the jobs lane if you want separate channels
- `SERPER_API_KEY` (new) — the Jina replacement
- *(optional)* `EVENTBRITE_TOKEN`, `REDDIT_*` if you register an app for higher limits

Editable config in `config/profile.mjs`: role lanes, remote rules, weights, `{window}` size, daily
dork count (30/40/50), Discord channel split.

---

## 9. Delivery format (Discord)

Two-section brief, once daily:

```
📡 Personal Radar — 2026-08-23   |   health: serper 42/50 · HN ✓ · reddit ✓ · llm ✓

🎯 ROLES FOR YOU
🚀 Founder / Cofounder / Founding eng
> Founding ML Engineer (remote, worldwide) — <startup>
> why: matches cv_ai_research_jobs; solo-founder post, direct email. TZ: US overlap.
> 🔗 <url>
🧠 AI / ML   💹 Quant   📦 Product/Project   ⚙️ Automation   🎬 AI Media   🎓 Fellowships

🌍 OPPORTUNITIES
🇵🇰 Pakistan / Virtual events
> AI Islamabad Meetup (in-person, Aug 30) …
🎓 Fellowships & grants   🏆 Hackathons & competitions
```

Each item ≤4 lines. Score-5 items get ⭐. The **health line** makes failures visible so you never
again wonder "why didn't it pick anything."

---

## 10. Build roadmap (phased, so you can start now)

**Phase 0 — de-risk the search backend (½ day)**
- Sign up for Serper.dev, add `SERPER_API_KEY`.
- Write `fetch/serper.mjs` + a 5-dork smoke test; confirm `site:` / `after:` / `OR` really work.
- Fix the LLM: replace `openrouter/free` with a real pinned model; add loud error logging.

**Phase 1 — Tier-1 sources (1 day) → immediate value**
- `fetch/apis.mjs`: HN Algolia + RemoteOK + Remotive + Reddit + WWR RSS.
- Minimal extract + remote filter + Discord out. *This alone beats v1 for Lane B.*

**Phase 2 — full intelligence (1–2 days)**
- `intel/classify.mjs` + `score.mjs` (7 lanes, person-post detection, saturation penalty).
- `dedup.mjs` + `data/radar_seen.json` persistence.

**Phase 3 — events + dork pool (1 day)** — fixes the PK-events gap
- `fetch/events.mjs` (Luma / Eventbrite / Meetup / PK ecosystem).
- Full ~120-dork pool with daily rotation, 30–50/run.

**Phase 4 — polish (½ day)**
- Health line, channel split, weights tuning, GitHub Actions workflow + committed seen-state.

**Phase 5 — optional/experimental**
- X/Twitter (only if you accept paid API or flaky nitter), Wellfound deeper reads.

---

## 11. Honest limitations (so expectations are right)

1. **Cofounder/"looking for a person" posts are genuinely scarce and gated.** HN threads and Reddit
   are the best free veins; LinkedIn/X are walled. Expect a *handful of high-quality* Lane-B hits some
   days, not a flood — which is the point (quality over the 300-applicant firehose).
2. **SERP APIs cost money past the free tier.** 30–50 dorks/day is cheap but not zero. If you want
   strictly $0, we lean harder on Tier-1 APIs + Google Programmable Search (100/day) + SearXNG.
3. **Event coverage depends on Luma/Eventbrite/Meetup discoverability.** Some PK meetups only exist on
   WhatsApp/Facebook groups we can't read; we'll catch the ones that have any public page.
4. **The LLM will occasionally misclassify.** The health line + `out/radar_raw.json` let you audit and
   tune the prompts; treat week 1 as calibration.
5. **This does not auto-apply.** It surfaces and ranks; you apply. (Auto-apply to founder posts would
   be spammy and counter to the "real person" goal.)

---

## 12. Decisions — LOCKED (2026-08-23)

1. **Search backend:** ✅ Free stack + free no-key APIs. Backend is now **dual** (code auto-detects):
   **Brave Search API** (recommended — real whole-web, ~2k/mo free) OR **Google CSE domain-restricted**
   (fully free/no card, but no open-web discovery — Google deprecated whole-web CSE). SearXNG dropped
   (public instances block Actions runners).
2. **Discord channels:** ✅ Split — `DISCORD_ROLES_WEBHOOK` + `DISCORD_RADAR_WEBHOOK`.
3. **Daily dork count:** ✅ 45 (change via `RADAR_DORK_COUNT`).
4. **v1 radar:** left in place for now; retire `opportunity_radar.mjs` after v2 has run cleanly for a
   week (disable its workflow so you don't get two Discord feeds).
5. **X/Twitter:** ✅ Skipped (paid API / flaky nitter — not worth building on).
6. **`openrouter/free`:** ✅ Kept as primary model (you confirmed it works) with automatic fallback to
   `deepseek`/`llama`/`gemini` free models and loud logging so it can never fail silently again.
7. **Anti-duplication:** ✅ Persistent `data/radar_seen.json` (30-day memory) instead of the brutal
   `after:yesterday` filter — so late-indexed Pakistan events are caught but never repeated.

---

## 13. Remaining next steps (for you)

1. Do the §SETUP (Google CSE key + CX, second Discord webhook, add 3 repo secrets).
2. Push these files to `origin main` (the workflow lives in the repo).
3. Trigger "🎯 Personal Radar v2" manually once from the Actions tab and watch the two Discord channels
   + the health line. Tune `RADAR_DORK_COUNT` / lane weights in `config.mjs` / `dorks.mjs` after week 1.
4. After a clean week, disable the old `opportunity_radar.yml` workflow.
   *(Done in code 2026-08-23: its daily `schedule` is commented out; manual-only now.)*

## 14. Phase 2 (later — parked by Hassan's request)

Add a **masters / international scholarships** lane (active/live MS scholarships, Erasmus/DAAD/GKS/CSC
style, "currently open" tracking — the Eduyo-Daily-style feed). Requires scholarship-specific source
domains (e.g. scholarship aggregators) added to the CSE + a scholarships category in the analyzer +
its own Discord grouping. Deliberately NOT built yet — v2 stays focused on jobs, LinkedIn,
fellowships, events (seminars/summits/meetups), and incubators.
