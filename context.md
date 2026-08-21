# Context for Future AI Assistants

## Repository Information
- **Project Name:** CohortZero_Daily_Run (also referred to as "thepost")
- **Remote Repository:** `https://github.com/hassankhan2510/thepost.git`
- **Branch:** `main`

## What this Project Does
This project is an automated daily news fetching and video/PDF/tweet-image rendering pipeline tailored for "Cohort Zero" (a tech startup incubator/venture builder) and Hassan Khan's personal X account (@Syedhassankhan_). It runs on GitHub Actions every day to:
1. Fetch live RSS feeds (tech, finance, health, politics, science, books — Pakistan and global).
2. Generate an engaging caption and image prompt using `openrouter/free` LLM API.
3. Generate a background AI image from Pollinations AI and overlay a custom logo.
4. Render 9:16 (Reel) and 1:1 (Post) MP4 videos using Remotion.
5. Create a PDF carousel using `pdf-lib`.
6. Generate elite top 0.01% quality tweet content on any topic (manual via `TWEET_TOPIC` env var, or auto from news).
7. Render premium X-style branded tweet card images (1080×1080 PNG) with avatar, name, blue tick, and tweet text.

## Key Files
- `package.json`: Node dependencies and scripts (`npm run run:all`, etc.).
- `scripts/fetch_news.mjs`: Fetches RSS, filters via `data/history.json`, and calls OpenRouter.
- `scripts/generate_assets.mjs`: Fetches AI image and copies `cohortzero-logo.png`.
- `scripts/generate_tweet.mjs`: Elite tweet content engine — generates top 0.01% tweets on any topic.
- `scripts/render_tweets.mjs`: Renders tweet card images via Remotion still.
- `src/Root.tsx`, `src/Reel.tsx`: Remotion video templates.
- `src/TweetCard.tsx`: Remotion tweet card image template (X-style dark card with avatar, blue tick).
- `scripts/make_carousel.mjs`: Builds the LinkedIn PDF.
- `.github/workflows/daily_run.yml`: The GitHub action that runs the pipeline.

## Tweet Workflow
- **Manual mode:** `TWEET_TOPIC="compound interest" npm run tweet && npm run render:tweets`
- **Auto mode:** `npm run tweet` (picks topic from `data/script.json` or RSS feeds)
- **Output:** `data/tweet.json` (text) + `out/tweets/tweet_0.png`, `tweet_1.png`, etc. (images)
- **Profile:** Hassan Khan (@Syedhassankhan_), blue verified tick, avatar from `public/assets/avatar.jpg`

## AI Instructions
- When making updates to this repository, ensure all changes are committed and pushed to `origin main`.
- Do not modify `data/history.json` manually; it is automatically managed by `fetch_news.mjs` to avoid repeating news.
- Keep the design strictly JS/Remotion-based. Do not change it to Python.

