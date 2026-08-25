/**
 * dorks.mjs — the Google CSE dork pool.
 *
 * Each dork is tagged with { lane, group }. `lane` is 'role' (jobs for Hassan) or 'opp'
 * (opportunities/events). We keep a large pool and sample DAILY_DORK_COUNT per run, rotating
 * by day-of-year so the whole pool is covered over a few days.
 *
 * NOTE: Google CSE honors site:, OR, quotes and parentheses. Freshness is applied via the
 * dateRestrict API param (see search.mjs), NOT an `after:` operator — CSE ignores `after:`.
 */

// ── LANE B: ROLES FOR HASSAN (remote-only) ────────────────────────────────────

const FOUNDER = [
    '"looking for a technical cofounder" (AI OR ML OR SaaS OR fintech)',
    '"looking for a co-founder" remote (startup OR "early stage")',
    '"seeking a technical cofounder" (AI OR software)',
    '"seeking co-founder" (CTO OR engineer) remote',
    '"looking for a cofounder" (CTO OR "technical partner")',
    '"founding engineer" remote (AI OR ML OR startup)',
    '"founding engineer" ("apply" OR "reach out" OR "DM me")',
    '"founding product manager" remote',
    '"first engineering hire" startup remote',
    '"join as a cofounder" OR "join our founding team"',
    '"I am looking for a" (cofounder OR "founding engineer" OR "technical partner")',
    '"we are looking for a" (cofounder OR "founding engineer") remote',
    '"early stage startup" "hiring" ("founding" OR "first hire") remote',
    'site:ycombinator.com/companies "founding engineer"',
    'site:ycombinator.com/companies remote (AI OR ML)',
    'site:wellfound.com (cofounder OR founding) remote',
    'site:wellfound.com remote ("machine learning" OR "AI engineer")',
    'site:indiehackers.com ("looking for a cofounder" OR "founding")',
    'site:reddit.com/r/cofounder (technical OR engineer OR AI)',
];

const AI_ML = [
    '"remote" ("machine learning engineer" OR "AI engineer") ("we\'re hiring" OR "apply")',
    '"remote" "research engineer" (AI OR "deep learning")',
    '"applied scientist" remote (NLP OR "computer vision")',
    '"research assistant" OR "research associate" remote (AI OR "machine learning")',
    '"ML engineer" remote (edge OR "computer vision" OR optics)',
    'site:remoteok.com (machine-learning OR ai)',
    'site:remotive.com ("machine learning" OR "ai engineer")',
    'site:weworkremotely.com ("machine learning" OR "ai")',
    '"remote" "LLM" (engineer OR "applied") hiring',
    '"remote" "PyTorch" (engineer OR researcher) hiring',
    '("part-time" OR contract) remote "machine learning" engineer',
    'site:jobs.lever.co (remote "machine learning" OR "AI engineer")',
    'site:boards.greenhouse.io remote "machine learning engineer"',
];

const QUANT = [
    '"quant developer" remote hiring',
    '"quantitative developer" remote (Python OR C++)',
    '"algorithmic trading" (developer OR engineer) remote',
    '"quant researcher" remote (crypto OR equities OR FX)',
    'site:reddit.com/r/quant hiring remote',
    'site:reddit.com/r/algotrading (hiring OR "looking for") developer',
    '"fintech" "machine learning" remote hiring',
    '"market microstructure" (researcher OR developer) remote',
    'site:remoteok.com (quant OR trading OR fintech)',
];

const PRODUCT = [
    '"associate product manager" remote startup',
    '"technical product manager" remote (AI OR ML)',
    '"product lead" OR "project lead" remote startup hiring',
    '"program manager" remote (AI OR technology)',
    '"delivery lead" OR "project manager" remote tech',
    'site:remotive.com (product OR project) manager',
    'site:weworkremotely.com (product OR project)',
    '"remote" "product manager" ("early stage" OR startup) hiring',
];

const AUTOMATION = [
    '"automation engineer" remote hiring',
    '"workflow automation" (engineer OR specialist) remote',
    '"AI automation" (engineer OR consultant) remote',
    '"RPA" OR "process automation" remote hiring',
    '"integrations engineer" remote (API OR automation)',
    '"platform engineer" OR "systems engineer" remote startup',
    'site:remoteok.com automation',
    '"n8n" OR "Zapier" OR "Make.com" (developer OR expert) remote hiring',
];

const MEDIA = [
    '"creative technologist" remote hiring',
    '"media automation" OR "content automation" (engineer OR developer) remote',
    '"generative media" OR "generative AI" (video OR content) engineer remote',
    '"video pipeline" OR "Remotion" developer remote',
    '"AI content" (engineer OR producer) remote startup',
    'site:remoteok.com (video OR content OR media) ai',
];

const FELLOWSHIP_ROLE = [
    '(fellowship OR grant) ("disability" OR "low vision" OR "assistive tech") apply',
    '"social impact" (fellowship OR "residency") remote apply',
    '"global south" (fellowship OR program OR grant) youth technology',
    '"changemaker" OR "young leaders" fellowship apply remote',
    'site:lu.ma (fellowship OR "social impact")',
    '"disability" "innovation" (grant OR accelerator OR fellowship) apply',
];

// ── LANE A: OPPORTUNITIES & EVENTS (fixes the Pakistan-events gap) ─────────────

const EVENTS_PK = [
    'site:lu.ma (Pakistan OR Islamabad OR Lahore OR Karachi)',
    'site:lu.ma (virtual OR online) (AI OR startup OR tech OR summit)',
    'site:eventbrite.com (Pakistan OR Islamabad) (tech OR AI OR startup)',
    'site:eventbrite.com online (AI OR startup OR founders)',
    'site:meetup.com (Islamabad OR Pakistan) (tech OR AI OR developer OR startup)',
    'site:meetup.com online (AI OR startup OR "machine learning")',
    '(Pakistan OR Islamabad) ("tech summit" OR "startup summit" OR conference OR webinar)',
    '(Pakistan OR Islamabad) (hackathon OR "startup weekend" OR bootcamp)',
    'site:techjuice.pk (event OR conference OR summit OR webinar)',
    'site:propakistani.pk (event OR conference OR summit OR webinar)',
    '"webinar" OR "virtual summit" (AI OR startup OR founders) register',
    '"online masterclass" OR "virtual workshop" (AI OR startup) free register',
];

const FELLOWSHIPS_OPP = [
    '(fellowship OR scholarship) "applications open" (youth OR technology OR innovation)',
    'site:linkedin.com/posts (fellowship OR grant) "applications open"',
    '("UNDP" OR "UNICEF" OR "ITU" OR "UN Women") (fellowship OR program OR apply OR youth)',
    '("MIT Solve" OR "Echoing Green" OR "Ashoka" OR "Acumen") (apply OR applications OR fellowship)',
    '("Chevening" OR "Fulbright" OR "Erasmus Mundus" OR "DAAD") (scholarship OR apply OR deadline)',
    '"call for applications" (innovation OR technology OR "social impact") 2026 OR 2027',
    '(grant OR prize) "up to" (USD OR "$" OR EUR) (innovation OR technology) apply',
];

const ACCELERATORS_OPP = [
    '("applications open" OR "now accepting") (accelerator OR incubator) (remote OR virtual OR global)',
    '("Y Combinator" OR "Techstars" OR "Antler" OR "Entrepreneur First") (applications OR batch OR apply)',
    'site:f6s.com (remote OR virtual OR global) (accelerator OR incubator)',
    '("virtual accelerator" OR "online incubator") "apply" founders',
    '("NVIDIA Inception" OR "Microsoft for Startups" OR "AWS Activate") apply',
    '("NIC" OR "i2i" OR "Plan9" OR "PSEB" OR "Ignite") Pakistan (program OR apply OR cohort)',
];

const HACKATHONS_OPP = [
    'site:devpost.com (hackathon OR challenge) (AI OR ML OR fintech OR health)',
    '"hackathon" (AI OR blockchain OR climate OR health) register online',
    '("Google" OR "Microsoft" OR "Meta") (challenge OR hackathon OR prize) apply',
    '"call for papers" (AI OR "machine learning") (deadline OR submit) 2026 OR 2027',
    '"pitch competition" OR "startup competition" (virtual OR online OR global) apply',
];

const CONFERENCES_OPP = [
    '("virtual conference" OR "online summit") (AI OR startup OR technology) register',
    '("NeurIPS" OR "ICML" OR "ICLR" OR "CVPR") (virtual OR "financial aid" OR "student") register',
    '"free" (webinar OR summit) (AI OR "machine learning" OR startup) 2026',
    '(conference OR summit) "travel grant" OR "scholarship" students apply',
];

// ── Assemble the pool ─────────────────────────────────────────────────────────
function tag(list, lane, group) {
    return list.map(q => ({ q, lane, group }));
}

export const DORK_POOL = [
    ...tag(FOUNDER, 'role', 'founder'),
    ...tag(AI_ML, 'role', 'ai_ml'),
    ...tag(QUANT, 'role', 'quant'),
    ...tag(PRODUCT, 'role', 'product'),
    ...tag(AUTOMATION, 'role', 'automation'),
    ...tag(MEDIA, 'role', 'media'),
    ...tag(FELLOWSHIP_ROLE, 'role', 'fellowship'),
    ...tag(EVENTS_PK, 'opp', 'events_pk'),
    ...tag(FELLOWSHIPS_OPP, 'opp', 'fellowships'),
    ...tag(ACCELERATORS_OPP, 'opp', 'accelerator'),
    ...tag(HACKATHONS_OPP, 'opp', 'hackathon'),
    ...tag(CONFERENCES_OPP, 'opp', 'conference'),
];

/**
 * Deterministically sample `count` dorks, rotating by day so the whole pool is covered
 * over several days. Guarantees both lanes are represented every run.
 */
export function sampleDorks(count, dayOfYear) {
    const roles = DORK_POOL.filter(d => d.lane === 'role');
    const opps = DORK_POOL.filter(d => d.lane === 'opp');
    // ~60% roles, 40% opportunities (Hassan's priority is his jobs).
    const roleN = Math.round(count * 0.6);
    const oppN = count - roleN;
    const rotate = (arr, n, offset) => {
        const out = [];
        for (let i = 0; i < n && i < arr.length; i++) {
            out.push(arr[(offset * n + i) % arr.length]);
        }
        return out;
    };
    return [...rotate(roles, roleN, dayOfYear), ...rotate(opps, oppN, dayOfYear)];
}
