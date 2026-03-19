import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { XMLParser } from 'fast-xml-parser'
import { createHash } from 'crypto'
import Parser from 'rss-parser'

const OPML_URL = 'https://lists.opml.org/hackerNewsStars.xml'
const DATA_DIR = 'data'
const ARTICLES_PATH = `${DATA_DIR}/articles.json`
const NEW_ARTICLES_PATH = `${DATA_DIR}/new-articles.json`
const CONCURRENCY = 10

function hashUrl(url) {
	return createHash('sha256').update(url).digest('hex').slice(0, 16)
}

function parseOpml(opml_content) {
	const parser = new XMLParser({ ignoreAttributes: false })
	const result = parser.parse(opml_content)
	const body = result.opml.body
	// Support both flat (<outline> directly) and nested (<outline><outline>) structures
	const raw = body.outline
	const outlines = Array.isArray(raw)
		? raw.flatMap(o => o.outline ? (Array.isArray(o.outline) ? o.outline : [o.outline]) : [o])
		: raw.outline ? (Array.isArray(raw.outline) ? raw.outline : [raw.outline]) : [raw]
	return outlines
		.filter(f => f['@_xmlUrl'])
		.map(f => ({
			title: f['@_text'] || f['@_title'],
			xml_url: f['@_xmlUrl'],
			html_url: f['@_htmlUrl'],
		}))
}

async function fetchWithTimeout(feed, rss_parser, timeout_ms = 8000) {
	return Promise.race([
		fetchFeed(feed, rss_parser),
		new Promise((_, reject) => setTimeout(() => reject(new Error(`Timeout after ${timeout_ms}ms`)), timeout_ms)),
	])
}

async function fetchFeed(feed, rss_parser) {
	try {
		const parsed = await rss_parser.parseURL(feed.xml_url)
		return parsed.items.map(item => ({
			id: hashUrl(item.link || item.guid || item.title),
			title: item.title || '',
			url: item.link || '',
			source: feed.title,
			source_url: feed.html_url,
			published: item.isoDate || item.pubDate || new Date().toISOString(),
			content_snippet: (item.contentSnippet || item.content || item.summary || '').slice(0, 2000),
		}))
	} catch (err) {
		process.stderr.write(`Failed to fetch ${feed.title}: ${err.message}\n`)
		return []
	}
}

async function main() {
	if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

	process.stdout.write(`Fetching OPML from ${OPML_URL}...\n`)
	const opml_res = await fetch(OPML_URL)
	if (!opml_res.ok) throw new Error(`Failed to fetch OPML: ${opml_res.status}`)
	const opml_content = await opml_res.text()
	const feeds = parseOpml(opml_content)
	process.stdout.write(`Parsed ${feeds.length} feeds from OPML\n`)

	const existing = existsSync(ARTICLES_PATH)
		? JSON.parse(readFileSync(ARTICLES_PATH, 'utf-8'))
		: { articles: [] }
	const existing_ids = new Set(existing.articles.map(a => a.id))

	const rss_parser = new Parser({
		timeout: 5000,
		headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DailyDigest/1.0)' },
	})
	const all_items = []

	for (let i = 0; i < feeds.length; i += CONCURRENCY) {
		const batch = feeds.slice(i, i + CONCURRENCY)
		const results = await Promise.allSettled(
			batch.map(feed => fetchWithTimeout(feed, rss_parser))
		)
		for (const result of results) {
			if (result.status === 'fulfilled') {
				all_items.push(...result.value)
			}
		}
	}

	const three_days_ago = Date.now() - 3 * 24 * 3600 * 1000
	const new_articles = all_items
		.filter(item => !existing_ids.has(item.id))
		.filter(item => new Date(item.published).getTime() > three_days_ago)
	process.stdout.write(`Found ${new_articles.length} new articles from last 3 days (${all_items.length} total fetched)\n`)

	writeFileSync(NEW_ARTICLES_PATH, JSON.stringify({ articles: new_articles }, null, 2))
	process.stdout.write(`Wrote new articles to ${NEW_ARTICLES_PATH}\n`)
}

main().then(() => process.exit(0)).catch(err => {
	process.stderr.write(`${err instanceof Error ? err.stack ?? err.message : String(err)}\n`)
	process.exit(1)
})
