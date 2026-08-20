# Context for Future AI Assistants

## Repository Information
- **Project Name:** CohortZero_Daily_Run (also referred to as "thepost")
- **Remote Repository:** `https://github.com/hassankhan2510/thepost.git`
- **Branch:** `main`

## What this Project Does
This project is an automated daily news fetching and video/PDF rendering pipeline tailored for "Cohort Zero" (a tech startup incubator/venture builder). It runs on GitHub Actions every day to:
1. Fetch live RSS feeds (Pakistan and global tech news).
2. Generate an engaging caption and image prompt using `openrouter/free` LLM API.
3. Generate a background AI image from Pollinations AI and overlay a custom logo.
4. Render 9:16 (Reel) and 1:1 (Post) MP4 videos using Remotion.
5. Create a PDF carousel using `pdf-lib`.

## Key Files
- `package.json`: Node dependencies and scripts (`npm run run:all`, etc.).
- `scripts/fetch_news.mjs`: Fetches RSS, filters via `data/history.json`, and calls OpenRouter.
- `scripts/generate_assets.mjs`: Fetches AI image and copies `cohortzero-logo.png`.
- `src/Root.tsx`, `src/Reel.tsx`: Remotion video templates.
- `scripts/make_carousel.mjs`: Builds the LinkedIn PDF.
- `.github/workflows/daily_run.yml`: The GitHub action that runs the pipeline.

## AI Instructions
- When making updates to this repository, ensure all changes are committed and pushed to `origin main`.
- Do not modify `data/history.json` manually; it is automatically managed by `fetch_news.mjs` to avoid repeating news.
- Keep the design strictly JS/Remotion-based. Do not change it to Python.
