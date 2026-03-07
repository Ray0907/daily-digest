import { readFileSync, writeFileSync, existsSync } from 'fs'
import { GoogleGenerativeAI } from '@google/generative-ai'

const DATA_DIR = 'data'
const NEW_ARTICLES_PATH = `${DATA_DIR}/new-articles.json`
const ARTICLES_PATH = `${DATA_DIR}/articles.json`
const MODEL_NAME = 'gemini-3.1-flash-lite-preview'
const RATE_LIMIT_DELAY = 12000
const BATCH_SIZE = 5

const PROMPT = `You are analyzing a blog post for a reading digest. Given the article title and content snippet, respond with ONLY valid JSON (no markdown fences):

{
  "summary_en": "2-3 sentence English summary of the key points",
  "summary_zh": "2-3 sentence Traditional Chinese (zh-TW) summary",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "pacer": "one of: P, A, C, E, R",
  "pacer_reason_en": "Brief reason for PACER classification",
  "pacer_reason_zh": "Brief reason in Traditional Chinese"
}

PACER categories:
- P (Procedural): How-to, tutorials, step-by-step guides
- A (Analogous): Draws parallels between domains, uses analogies
- C (Conceptual): Theories, explanations, "what is" content
- E (Evidence): Data, case studies, benchmarks, experiments
- R (Reference): Lookup material, lists, specifications

Article title: {{TITLE}}
Source: {{SOURCE}}
Content: {{CONTENT}}`

async function summarizeArticle(genai_model, article) {
	const prompt = PROMPT
		.replace('{{TITLE}}', article.title)
		.replace('{{SOURCE}}', article.source)
		.replace('{{CONTENT}}', article.content_snippet || '(no content available)')

	const result = await genai_model.generateContent(prompt)
	const text = result.response.text().trim()

	const json_text = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '')
	return JSON.parse(json_text)
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
	const api_key = process.env.GOOGLE_API_KEY
	if (!api_key) {
		console.error('GOOGLE_API_KEY environment variable is required')
		process.exit(1)
	}

	if (!existsSync(NEW_ARTICLES_PATH)) {
		console.log('No new articles to process')
		return
	}

	const new_data = JSON.parse(readFileSync(NEW_ARTICLES_PATH, 'utf-8'))
	if (new_data.articles.length === 0) {
		console.log('No new articles to process')
		return
	}

	const existing = existsSync(ARTICLES_PATH)
		? JSON.parse(readFileSync(ARTICLES_PATH, 'utf-8'))
		: { last_updated: '', articles: [] }

	const genai = new GoogleGenerativeAI(api_key)
	const model = genai.getGenerativeModel({ model: MODEL_NAME })

	console.log(`Processing ${new_data.articles.length} new articles (batch size: ${BATCH_SIZE})...`)

	const processed = []
	for (let i = 0; i < new_data.articles.length; i += BATCH_SIZE) {
		const batch = new_data.articles.slice(i, i + BATCH_SIZE)
		console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(new_data.articles.length / BATCH_SIZE)} (${batch.length} articles)`)

		const results = await Promise.allSettled(
			batch.map(async (article) => {
				console.log(`    Summarizing: ${article.title}`)
				const enriched = await summarizeArticle(model, article)
				return {
					id: article.id,
					title: article.title,
					url: article.url,
					source: article.source,
					source_url: article.source_url,
					published: article.published,
					summary_en: enriched.summary_en,
					summary_zh: enriched.summary_zh,
					keywords: enriched.keywords,
					pacer: enriched.pacer,
					pacer_reason_en: enriched.pacer_reason_en,
					pacer_reason_zh: enriched.pacer_reason_zh,
				}
			})
		)

		for (let j = 0; j < results.length; j++) {
			if (results[j].status === 'fulfilled') {
				processed.push(results[j].value)
			} else {
				console.error(`    Failed to summarize "${batch[j].title}": ${results[j].reason?.message}`)
				processed.push({
					...batch[j],
					summary_en: '',
					summary_zh: '',
					keywords: [],
					pacer: 'C',
					pacer_reason_en: 'Classification unavailable',
					pacer_reason_zh: 'Classification unavailable',
				})
			}
		}

		await sleep(RATE_LIMIT_DELAY)
	}

	existing.articles = [...processed, ...existing.articles]
	existing.last_updated = new Date().toISOString()

	writeFileSync(ARTICLES_PATH, JSON.stringify(existing, null, 2))
	console.log(`Updated ${ARTICLES_PATH} with ${processed.length} new articles (${existing.articles.length} total)`)
}

main()
