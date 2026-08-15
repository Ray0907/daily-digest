import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArticleCard } from '../components/ArticleCard'
import { FeaturedCard } from '../components/FeaturedCard'
import { FilterBar } from '../components/FilterBar'
import { SkeletonCard } from '../components/SkeletonCard'
import { useArticles } from '../hooks/useArticles'
import { articleToMarkdown, downloadMarkdown } from '../lib/export'

const DAY_IN_MS = 24 * 60 * 60 * 1000

function getRecentArticles(articles) {
	const time_latest = Math.max(...articles.map(article => (
		new Date(article.published).getTime()
	)))
	const time_cutoff = time_latest - (6 * DAY_IN_MS)

	return articles.filter(article => (
		new Date(article.published).getTime() >= time_cutoff
	))
}

function filterArticles(articles, search_query, active_pacers, active_source) {
	return getRecentArticles(articles).filter(article => {
		const query = search_query.toLowerCase()
		const matches_search = !query
			|| (article.title || '').toLowerCase().includes(query)
			|| (article.summary_en || '').toLowerCase().includes(query)
			|| (article.summary_zh || '').toLowerCase().includes(query)
			|| (article.keywords || []).some(keyword => keyword.toLowerCase().includes(query))
		const matches_pacer = active_pacers.size === 0
			|| active_pacers.has(article.pacer)
		const matches_source = !active_source || article.source === active_source

		return matches_search && matches_pacer && matches_source
	})
}

function groupArticles(articles) {
	const groups = new Map()

	articles.forEach(article => {
		const date_key = article.published.slice(0, 10)
		const date_articles = groups.get(date_key) || []
		date_articles.push(article)
		groups.set(date_key, date_articles)
	})

	return [...groups.entries()].sort(([date_a], [date_b]) => (
		date_b.localeCompare(date_a)
	))
}

function formatDateLabel(date_key, t, language) {
	const today_key = new Date().toISOString().slice(0, 10)
	const yesterday_key = new Date(Date.now() - DAY_IN_MS).toISOString().slice(0, 10)

	if (date_key === today_key) return t('home.today')
	if (date_key === yesterday_key) return t('home.yesterday')

	return new Date(`${date_key}T12:00:00Z`).toLocaleDateString(
		language === 'zh' ? 'zh-TW' : 'en-US',
		{ year: 'numeric', month: 'long', day: 'numeric' },
	)
}

function HeroSection({ article_count, source_count }) {
	const { t } = useTranslation()

	return (
		<section className="home-hero" aria-labelledby="home-title">
			<div>
				<p className="eyebrow">{t('home.hero_eyebrow')}</p>
				<h1 id="home-title">{t('home.hero_title')}</h1>
			</div>
			<div className="home-hero__aside">
				<p className="home-hero__intro">{t('home.hero_intro')}</p>
				<dl className="issue-index">
					<div>
						<dt>{t('home.articles_selected')}</dt>
						<dd>{String(article_count).padStart(2, '0')}</dd>
					</div>
					<div>
						<dt>{t('home.sources_scanned')}</dt>
						<dd>{String(source_count).padStart(2, '0')}</dd>
					</div>
				</dl>
			</div>
		</section>
	)
}

function ArticleGroup({ date_key, articles, is_first, onPacerToggle, onKeywordSearch }) {
	const { t, i18n } = useTranslation()

	return (
		<section className="digest-section" aria-labelledby={`date-${date_key}`}>
			<header className="section-heading">
				<div>
					<span className="section-index">{is_first ? '01' : '—'}</span>
					<h2 id={`date-${date_key}`}>
						{formatDateLabel(date_key, t, i18n.language)}
					</h2>
				</div>
				<span>{articles.length} {t('home.posts')}</span>
			</header>

			{is_first && articles.length >= 3 ? (
				<>
					<div className="lead-grid">
						<FeaturedCard
							article={articles[0]}
							onPacerToggle={onPacerToggle}
							onKeywordSearch={onKeywordSearch}
						/>
						<div className="lead-grid__rail">
							{articles.slice(1, 3).map(article => (
								<ArticleCard
									key={article.id}
									article={article}
									compact
									onPacerToggle={onPacerToggle}
									onKeywordSearch={onKeywordSearch}
								/>
							))}
						</div>
					</div>
					{articles.length > 3 && (
						<ArticleGrid
							articles={articles.slice(3)}
							onPacerToggle={onPacerToggle}
							onKeywordSearch={onKeywordSearch}
						/>
					)}
				</>
			) : (
				<ArticleGrid
					articles={articles}
					onPacerToggle={onPacerToggle}
					onKeywordSearch={onKeywordSearch}
				/>
			)}
		</section>
	)
}

function ArticleGrid({ articles, onPacerToggle, onKeywordSearch }) {
	return (
		<div className="article-grid">
			{articles.map(article => (
				<ArticleCard
					key={article.id}
					article={article}
					onPacerToggle={onPacerToggle}
					onKeywordSearch={onKeywordSearch}
				/>
			))}
		</div>
	)
}

function LoadingState() {
	return (
		<div className="page-shell loading-grid" aria-label="Loading articles">
			<SkeletonCard size="lg" />
			<SkeletonCard />
			<SkeletonCard />
		</div>
	)
}

export function HomePage() {
	const { articles, is_loading } = useArticles()
	const { t, i18n } = useTranslation()
	const [search_query, setSearchQuery] = useState('')
	const [active_pacers, setActivePacers] = useState(new Set())
	const [active_source, setActiveSource] = useState('')

	const sources = useMemo(() => (
		[...new Set(articles.map(article => article.source))].sort()
	), [articles])
	const filtered_articles = useMemo(() => (
		filterArticles(articles, search_query, active_pacers, active_source)
	), [active_pacers, active_source, articles, search_query])
	const article_groups = useMemo(() => (
		groupArticles(filtered_articles)
	), [filtered_articles])

	const handlePacerToggle = useCallback((pacer, options) => {
		setActivePacers(current_pacers => {
			if (options?.exclusive) {
				if (current_pacers.size === 1 && current_pacers.has(pacer)) return new Set()
				return new Set([pacer])
			}
			const next_pacers = new Set(current_pacers)
			if (next_pacers.has(pacer)) next_pacers.delete(pacer)
			else next_pacers.add(pacer)
			return next_pacers
		})
	}, [])

	const handleDownload = useCallback((range) => {
		const selected_articles = range === 'today'
			? (article_groups[0]?.[1] || [])
			: filtered_articles
		const content = selected_articles
			.map(article => articleToMarkdown(article, i18n.language))
			.join('\n---\n\n')
		const date_stamp = new Date().toISOString().slice(0, 10)
		downloadMarkdown(`daily-digest-${range}-${date_stamp}.md`, content)
	}, [article_groups, filtered_articles, i18n.language])

	if (is_loading) return <LoadingState />

	return (
		<div className="page-shell home-page">
			<HeroSection article_count={filtered_articles.length} source_count={sources.length} />
			<FilterBar
				search_query={search_query}
				onSearchChange={setSearchQuery}
				active_pacers={active_pacers}
				onPacerToggle={handlePacerToggle}
				sources={sources}
				active_source={active_source}
				onSourceChange={setActiveSource}
			/>

			{article_groups.map(([date_key, date_articles], index) => (
				<ArticleGroup
					key={date_key}
					date_key={date_key}
					articles={date_articles}
					is_first={index === 0}
					onPacerToggle={handlePacerToggle}
					onKeywordSearch={setSearchQuery}
				/>
			))}

			{article_groups.length === 0 && (
				<div className="empty-state">
					<span aria-hidden="true">∅</span>
					<h2>{t('home.no_results_title')}</h2>
					<p>{t('home.no_results')}</p>
				</div>
			)}

			{filtered_articles.length > 0 && (
				<div className="download-panel">
					<div>
						<p className="eyebrow">{t('home.keep_reading')}</p>
						<h2>{t('home.export_title')}</h2>
					</div>
					<div className="download-panel__actions">
						<button type="button" onClick={() => handleDownload('today')}>
							{t('home.download_today')}
						</button>
						<button
							type="button"
							className="clay-button"
							onClick={() => handleDownload('week')}
						>
							{t('home.download_week')}
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
