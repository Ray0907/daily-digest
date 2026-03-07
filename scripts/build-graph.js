import { readFileSync, writeFileSync, existsSync } from 'fs'

const ARTICLES_PATH = 'data/articles.json'
const GRAPH_PATH = 'data/graph.json'
const MIN_SHARED_KEYWORDS = 2

function main() {
	if (!existsSync(ARTICLES_PATH)) {
		console.log('No articles.json found')
		return
	}

	const data = JSON.parse(readFileSync(ARTICLES_PATH, 'utf-8'))
	const articles = data.articles

	const nodes = articles.map(a => ({
		id: a.id,
		title: a.title,
		source: a.source,
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
	console.log(`Graph: ${nodes.length} nodes, ${links.length} links`)
}

main()
