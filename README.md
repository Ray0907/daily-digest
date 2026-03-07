# Daily Digest

> Inspired by Andrej Karpathy's reading list

A static RSS aggregator that fetches 80+ curated tech blog feeds daily, generates bilingual (EN/ZH-TW) summaries with AI, classifies articles using the PACER learning framework, and visualizes knowledge connections -- all deployed to GitHub Pages with zero server costs.

## Features

- **Daily RSS aggregation** from 80+ curated tech blogs
- **AI-powered summaries** in English and Traditional Chinese (Gemini API)
- **PACER classification** based on Justin Sung's learning framework
- **Interactive knowledge graph** showing article relationships (D3.js)
- **Dark/Light mode** with system preference detection
- **i18n** toggle between English and Traditional Chinese
- **Markdown export** -- copy single articles or download daily/weekly/monthly batches
- **RSS feed output** -- subscribe to the curated feed with summaries
- **Archive** -- browse all historical articles by month

## PACER Framework

Each article is classified into one of five learning categories:

| Category | Description | Priority |
|----------|-------------|----------|
| **P** - Procedural | How-to guides, tutorials | High (practice immediately) |
| **A** - Analogous | Cross-domain parallels | High (critique connections) |
| **C** - Conceptual | Theories, explanations | High (map relationships) |
| **E** - Evidence | Data, case studies | Medium (store for later) |
| **R** - Reference | Lookup material | Low (save and review) |

## Setup

### Prerequisites

- Node.js >= 22
- pnpm

### Local Development

```bash
git clone <your-repo-url>
cd daily-digest
pnpm install
pnpm dev
```

Sample data is included in `public/data/` for local development.

### Deployment

1. Fork this repo
2. Go to Settings > Secrets and variables > Actions
3. Add `GOOGLE_API_KEY` secret (get from Google AI Studio)
4. Go to Settings > Pages > Source: Deploy from a branch > gh-pages
5. The GitHub Action runs daily at UTC 06:00, or trigger manually from Actions tab

### Customize Feeds

Edit `feeds.opml` to add or remove RSS feeds.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **i18n:** react-i18next
- **Graph:** D3.js force-directed graph
- **AI:** Gemini API (gemini-3.1-flash-lite-preview)
- **CI/CD:** GitHub Actions
- **Hosting:** GitHub Pages (static)

## Subscribe

Once deployed, subscribe to your digest at:

```
https://YOUR_USERNAME.github.io/daily-digest/feed.xml
```

Works with any RSS reader, Obsidian (RSS Reader plugin), or Notion (via Zapier/Make).

## Cost

- **GitHub Actions:** ~150 min/month (free tier: 2,000 min)
- **Gemini API:** Free tier covers ~1,500 requests/day
- **GitHub Pages:** Free for public repos

**Total: $0/month**

## License

MIT
