import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { XMLParser } from 'fast-xml-parser'
import { createHash } from 'crypto'
import Parser from 'rss-parser'

const OPML_PATH = 'feeds.opml'
const DATA_DIR = 'data'
const ARTICLES_PATH = `${DATA_DIR}/articles.json`
const NEW_ARTICLES_PATH = `${DATA_DIR}/new-articles.json`
const CONCURRENCY = 5

function hashUrl(url) {
	return createHash('sha256').update(url).digest('hex').slice(0, 16)
}

function parseOpml(opml_content) {
	const parser = new XMLParser({ ignoreAttributes: false })
	const result = parser.parse(opml_content)
	const outlines = result.opml.body.outline.outline
	const feeds = Array.isArray(outlines) ? outlines : [outlines]
	return feeds.map(f => ({
		title: f['@_text'] || f['@_title'],
		xml_url: f['@_xmlUrl'],
		html_url: f['@_htmlUrl'],
	}))
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
			content_snippet: (item.contentSnippet || item.content || '').slice(0, 2000),
		}))
	} catch (err) {
		console.error(`Failed to fetch ${feed.title}: ${err.message}`)
		return []
	}
}

async function main() {
	if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })

	const opml_content = readFileSync(OPML_PATH, 'utf-8')
	const feeds = parseOpml(opml_content)
	console.log(`Parsed ${feeds.length} feeds from OPML`)

	const existing = existsSync(ARTICLES_PATH)
		? JSON.parse(readFileSync(ARTICLES_PATH, 'utf-8'))
		: { articles: [] }
	const existing_ids = new Set(existing.articles.map(a => a.id))

	const rss_parser = new Parser({ timeout: 10000 })
	const all_items = []

	for (let i = 0; i < feeds.length; i += CONCURRENCY) {
		const batch = feeds.slice(i, i + CONCURRENCY)
		const results = await Promise.allSettled(
			batch.map(feed => fetchFeed(feed, rss_parser))
		)
		for (const result of results) {
			if (result.status === 'fulfilled') {
				all_items.push(...result.value)
			}
		}
	}

	const new_articles = all_items.filter(item => !existing_ids.has(item.id))
	console.log(`Found ${new_articles.length} new articles (${all_items.length} total fetched)`)

	writeFileSync(NEW_ARTICLES_PATH, JSON.stringify({ articles: new_articles }, null, 2))
	console.log(`Wrote new articles to ${NEW_ARTICLES_PATH}`)
}

main()
