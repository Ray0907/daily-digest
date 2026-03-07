import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useArticles } from '../hooks/useArticles'
import { ArticleCard } from '../components/ArticleCard'
import { articleToMarkdown, downloadMarkdown } from '../lib/export'

export function ArchivePage() {
	const [month, setMonth] = useState(null)
	const { articles, is_loading } = useArticles()
	const { t, i18n } = useTranslation()

	const current_month = month || new Date().toISOString().slice(0, 7)

	const { months, month_articles } = useMemo(() => {
		const month_set = new Set()
		const filtered = []

		for (const a of articles) {
			const m = a.published.slice(0, 7)
			month_set.add(m)
			if (m === current_month) filtered.push(a)
		}

		filtered.sort((a, b) => new Date(b.published) - new Date(a.published))
		return {
			months: [...month_set].sort().reverse(),
			month_articles: filtered,
		}
	}, [articles, current_month])

	const current_idx = months.indexOf(current_month)
	const prev_month = current_idx < months.length - 1 ? months[current_idx + 1] : null
	const next_month = current_idx > 0 ? months[current_idx - 1] : null

	const handleDownloadMonth = () => {
		const content = month_articles.map(a => articleToMarkdown(a, i18n.language)).join('\n---\n\n')
		downloadMarkdown(`daily-digest-${current_month}.md`, content)
	}

	if (is_loading) {
		return <div className="pt-4 max-w-3xl mx-auto px-4 text-text-muted">Loading...</div>
	}

	const month_label = new Date(current_month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })

	return (
		<div className="pt-4 max-w-3xl mx-auto px-4 pb-16">
			<div className="flex items-center justify-between mb-6">
				<h1 className="font-serif text-2xl font-semibold">
					{t('archive.title')} - {month_label}
				</h1>
				<span className="text-sm text-text-muted">
					{month_articles.length} {t('archive.articles')}
				</span>
			</div>

			<div className="space-y-4 mb-8">
				{month_articles.map(article => (
					<ArticleCard key={article.id} article={article} />
				))}
			</div>

			{month_articles.length === 0 && (
				<p className="text-text-muted text-center py-12">
					No articles for this month.
				</p>
			)}

			<div className="flex items-center justify-between">
				{prev_month ? (
					<button onClick={() => setMonth(prev_month)} className="text-sm text-accent hover:underline cursor-pointer">
						&larr; {prev_month}
					</button>
				) : <span />}

				<button onClick={handleDownloadMonth} className="text-sm text-accent hover:underline cursor-pointer">
					Download {month_label} MD
				</button>

				{next_month ? (
					<button onClick={() => setMonth(next_month)} className="text-sm text-accent hover:underline cursor-pointer">
						{next_month} &rarr;
					</button>
				) : <span />}
			</div>
		</div>
	)
}
