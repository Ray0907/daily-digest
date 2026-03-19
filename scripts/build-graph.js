import { readFileSync, writeFileSync, existsSync } from 'fs'

const ARTICLES_PATH = 'data/articles.json'
const GRAPH_PATH = 'data/graph.json'
const MIN_SHARED_KEYWORDS = 3
const MAX_PER_SOURCE = 5

function main() {
	if (!existsSync(ARTICLES_PATH)) {
		process.stdout.write('No articles.json found\n')
		return
	}

	const data = JSON.parse(readFileSync(ARTICLES_PATH, 'utf-8'))

	// Limit articles per source to avoid single-source domination
	const source_counts = {}
	const articles = data.articles
		.sort((a, b) => new Date(b.published) - new Date(a.published))
		.filter(a => {
			source_counts[a.source] = (source_counts[a.source] || 0) + 1
			return source_counts[a.source] <= MAX_PER_SOURCE
		})

	const nodes = articles.map(a => ({
		id: a.id,
		title: a.title,
		source: a.source,
		source_url: a.source_url,
		url: a.url,
		pacer: a.pacer,
		keywords: a.keywords || [],
		published: a.published,
	}))

	const links = []
	for (let i = 0; i < articles.length; i++) {
		const kw_i = new Set(articles[i].keywords || [])
		for (let j = i + 1; j < articles.length; j++) {
			const kw_j = articles[j].keywords || []
			const shared = kw_j.filter(k => kw_i.has(k))
			if (shared.length >= MIN_SHARED_KEYWORDS) {
				links.push({
					source: articles[i].id,
					target: articles[j].id,
					shared_keywords: shared,
					strength: shared.length / Math.max(kw_i.size, kw_j.length),
				})
			}
		}
	}

	const graph = { nodes, links }
	writeFileSync(GRAPH_PATH, JSON.stringify(graph, null, 2))
	process.stdout.write(`Graph: ${nodes.length} nodes, ${links.length} links\n`)
}

main()
