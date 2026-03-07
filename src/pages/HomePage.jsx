import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useArticles } from '../hooks/useArticles'
import { ArticleCard } from '../components/ArticleCard'
import { articleToMarkdown, downloadMarkdown } from '../lib/export'

export function HomePage() {
	const { articles, is_loading } = useArticles()
	const { t, i18n } = useTranslation()

	const seven_days_ago = Date.now() - 7 * 24 * 3600 * 1000

	const grouped = useMemo(() => {
		const recent = articles
			.filter(a => new Date(a.published).getTime() > seven_days_ago)
			.sort((a, b) => new Date(b.published) - new Date(a.published))

		const groups = {}
		for (const article of recent) {
			const date_key = new Date(article.published).toLocaleDateString('en-US', {
				year: 'numeric', month: 'long', day: 'numeric',
			})
			if (!groups[date_key]) groups[date_key] = []
			groups[date_key].push(article)
		}
		return groups
	}, [articles])

	const handleDownloadToday = () => {
		const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
		const today_articles = grouped[today] || []
		const content = today_articles.map(a => articleToMarkdown(a, i18n.language)).join('\n---\n\n')
		downloadMarkdown(`daily-digest-${new Date().toISOString().slice(0, 10)}.md`, content)
	}

	const handleDownloadWeek = () => {
		const all_recent = Object.values(grouped).flat()
		const content = all_recent.map(a => articleToMarkdown(a, i18n.language)).join('\n---\n\n')
		downloadMarkdown(`daily-digest-week-${new Date().toISOString().slice(0, 10)}.md`, content)
	}

	if (is_loading) {
		return <div className="pt-28 max-w-3xl mx-auto px-4 text-text-muted">Loading...</div>
	}

	return (
		<div className="pt-28 max-w-3xl mx-auto px-4 pb-16">
			{Object.entries(grouped).map(([date, date_articles]) => (
				<section key={date} className="mb-8">
					<div className="flex items-center justify-between mb-4">
						<h2 className="font-serif text-lg font-semibold text-text-primary dark:text-slate-200">
							{formatDateLabel(date, t)}
						</h2>
						<span className="text-sm text-text-muted dark:text-slate-400">
							{date_articles.length} {t('home.posts')}
						</span>
					</div>
					<div className="space-y-4">
						{date_articles.map(article => (
							<ArticleCard key={article.id} article={article} />
						))}
					</div>
				</section>
			))}

			{Object.keys(grouped).length === 0 && (
				<p className="text-text-muted dark:text-slate-400 text-center py-12">
					No articles from the last 7 days.
				</p>
			)}

			{Object.keys(grouped).length > 0 && (
				<div className="flex gap-4 mt-8">
					<button onClick={handleDownloadToday} className="text-sm text-accent hover:underline cursor-pointer">
						{t('home.download_today')}
					</button>
					<button onClick={handleDownloadWeek} className="text-sm text-accent hover:underline cursor-pointer">
						{t('home.download_week')}
					</button>
				</div>
			)}
		</div>
	)
}

function formatDateLabel(date_str, t) {
	const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
	const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
	if (date_str === today) return t('home.today')
	if (date_str === yesterday) return t('home.yesterday')
	return date_str
}
