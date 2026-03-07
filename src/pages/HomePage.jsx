import { useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useArticles } from '../hooks/useArticles'
import { ArticleCard } from '../components/ArticleCard'
import { FeaturedCard } from '../components/FeaturedCard'
import { FilterBar } from '../components/FilterBar'
import { SkeletonCard } from '../components/SkeletonCard'
import { articleToMarkdown, downloadMarkdown } from '../lib/export'

export function HomePage() {
	const { articles, is_loading } = useArticles()
	const { t, i18n } = useTranslation()

	const [search_query, setSearchQuery] = useState('')
	const [active_pacers, setActivePacers] = useState(new Set())
	const [active_source, setActiveSource] = useState('')

	const handlePacerToggle = useCallback((pacer, opts) => {
		setActivePacers(prev => {
			if (opts?.exclusive) {
				// From card badge: exclusive toggle (click = only this, click again = clear)
				if (prev.size === 1 && prev.has(pacer)) return new Set()
				return new Set([pacer])
			}
			// From FilterBar: multi-select toggle
			const next = new Set(prev)
			if (next.has(pacer)) next.delete(pacer)
			else next.add(pacer)
			return next
		})
	}, [])

	const three_days_ago = useMemo(() => Date.now() - 3 * 24 * 3600 * 1000, [])

	const sources = useMemo(() => {
		const set = new Set(articles.map(a => a.source))
		return [...set].sort()
	}, [articles])

	const filtered = useMemo(() => {
		return articles
			.filter(a => new Date(a.published).getTime() > three_days_ago)
			.filter(a => {
				if (search_query) {
					const q = search_query.toLowerCase()
					const matches = (a.title || '').toLowerCase().includes(q)
						|| (a.summary_en || '').toLowerCase().includes(q)
						|| (a.summary_zh || '').toLowerCase().includes(q)
						|| (a.keywords || []).some(k => k.toLowerCase().includes(q))
					if (!matches) return false
				}
				if (active_pacers.size > 0 && !active_pacers.has(a.pacer)) return false
				if (active_source && a.source !== active_source) return false
				return true
			})
			.sort((a, b) => new Date(b.published) - new Date(a.published))
	}, [articles, search_query, active_pacers, active_source])

	const grouped = useMemo(() => {
		const groups = {}
		for (const article of filtered) {
			const date_key = new Date(article.published).toLocaleDateString('en-US', {
				year: 'numeric', month: 'long', day: 'numeric',
			})
			if (!groups[date_key]) groups[date_key] = []
			groups[date_key].push(article)
		}
		return groups
	}, [filtered])

	const handleDownloadToday = () => {
		const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
		const today_articles = grouped[today] || []
		const content = today_articles.map(a => articleToMarkdown(a, i18n.language)).join('\n---\n\n')
		downloadMarkdown(`daily-digest-${new Date().toISOString().slice(0, 10)}.md`, content)
	}

	const handleDownloadWeek = () => {
		const content = filtered.map(a => articleToMarkdown(a, i18n.language)).join('\n---\n\n')
		downloadMarkdown(`daily-digest-week-${new Date().toISOString().slice(0, 10)}.md`, content)
	}

	if (is_loading) {
		return (
			<div className="pt-28 max-w-5xl mx-auto px-4 pb-16">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="md:col-span-2"><SkeletonCard size="lg" /></div>
					<div><SkeletonCard size="md" /></div>
					<div><SkeletonCard size="md" /></div>
					<div><SkeletonCard size="md" /></div>
					<div><SkeletonCard size="md" /></div>
				</div>
			</div>
		)
	}

	return (
		<div className="pt-28 max-w-5xl mx-auto px-4 pb-16">
			<FilterBar
				search_query={search_query}
				onSearchChange={setSearchQuery}
				active_pacers={active_pacers}
				onPacerToggle={handlePacerToggle}
				sources={sources}
				active_source={active_source}
				onSourceChange={setActiveSource}
			/>

			{Object.entries(grouped).map(([date, date_articles], group_idx) => (
				<section key={date} className="mb-10">
					<div className="flex items-center justify-between mb-4">
						<h2 className="font-serif text-lg font-semibold text-text-primary dark:text-slate-200">
							{formatDateLabel(date, t)}
						</h2>
						<span className="text-sm text-text-muted dark:text-slate-400">
							{date_articles.length} {t('home.posts')}
						</span>
					</div>

					{/* Magazine layout: first group gets featured card */}
					{group_idx === 0 && date_articles.length >= 3 ? (
						<>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
								<div className="md:col-span-2" style={{ animationDelay: '0ms', animation: 'fadeInUp 0.3s ease-out both' }}>
									<FeaturedCard article={date_articles[0]} onPacerToggle={handlePacerToggle} onKeywordSearch={setSearchQuery} />
								</div>
								<div className="space-y-4">
									{date_articles.slice(1, 3).map((article, i) => (
										<div key={article.id} style={{ animationDelay: `${(i + 1) * 50}ms`, animation: 'fadeInUp 0.3s ease-out both' }}>
											<ArticleCard article={article} compact onPacerToggle={handlePacerToggle} onKeywordSearch={setSearchQuery} />
										</div>
									))}
								</div>
							</div>
							{date_articles.length > 3 && (
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{date_articles.slice(3).map((article, i) => (
										<div key={article.id} style={{ animationDelay: `${(i + 3) * 50}ms`, animation: 'fadeInUp 0.3s ease-out both' }}>
											<ArticleCard article={article} onPacerToggle={handlePacerToggle} onKeywordSearch={setSearchQuery} />
										</div>
									))}
								</div>
							)}
						</>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{date_articles.map((article, i) => (
								<div key={article.id} style={{ animationDelay: `${i * 50}ms`, animation: 'fadeInUp 0.3s ease-out both' }}>
									<ArticleCard article={article} onPacerToggle={handlePacerToggle} onKeywordSearch={setSearchQuery} />
								</div>
							))}
						</div>
					)}
				</section>
			))}

			{Object.keys(grouped).length === 0 && (
				<p className="text-text-muted dark:text-slate-400 text-center py-12">
					{search_query || active_pacers.size > 0 || active_source
						? (t('home.no_results') || 'No articles match your filters. Try adjusting your search.')
						: 'No articles from the last 7 days.'}
				</p>
			)}

			{filtered.length > 0 && (
				<div className="flex gap-4 mt-8">
					<button onClick={handleDownloadToday} className="text-sm text-accent hover:underline cursor-pointer focus:ring-2 focus:ring-accent focus:outline-none rounded px-2 py-1">
						{t('home.download_today')}
					</button>
					<button onClick={handleDownloadWeek} className="text-sm text-accent hover:underline cursor-pointer focus:ring-2 focus:ring-accent focus:outline-none rounded px-2 py-1">
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
