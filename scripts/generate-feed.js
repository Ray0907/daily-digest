import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'

const ARTICLES_PATH = 'data/articles.json'
const FEED_PATH = 'public/feed.xml'
const SITE_URL = 'https://YOUR_USERNAME.github.io/daily-digest'
const FEED_TITLE = 'Daily Digest'
const FEED_DESCRIPTION = "Curated tech blog summaries, inspired by Andrej Karpathy's reading list"

function escapeXml(str) {
	if (!str) return ''
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
}

function main() {
	if (!existsSync(ARTICLES_PATH)) {
		process.stdout.write('No articles.json found\n')
		return
	}

	if (!existsSync('public')) mkdirSync('public', { recursive: true })

	const data = JSON.parse(readFileSync(ARTICLES_PATH, 'utf-8'))
	const recent = data.articles.slice(0, 100)

	const items = recent.map(a => `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${escapeXml(a.url)}</link>
      <guid>${escapeXml(a.url)}</guid>
      <pubDate>${new Date(a.published).toUTCString()}</pubDate>
      <source url="${escapeXml(a.source_url || '')}">${escapeXml(a.source)}</source>
      <description>${escapeXml(a.summary_en || '')}</description>
    </item>`).join('\n')

	const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${FEED_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${FEED_DESCRIPTION}</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`

	writeFileSync(FEED_PATH, feed)
	process.stdout.write(`Generated RSS feed with ${recent.length} items\n`)
}

main()
