import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArticleCard } from '../components/ArticleCard'
import { useArticles } from '../hooks/useArticles'
import { articleToMarkdown, downloadMarkdown } from '../lib/export'

function getArchiveData(articles, selected_month) {
	const months = [...new Set(articles.map(article => article.published.slice(0, 7)))]
		.sort()
		.reverse()
	const current_month = selected_month || months[0] || ''
	const month_articles = articles
		.filter(article => article.published.startsWith(current_month))
		.sort((article_a, article_b) => (
			new Date(article_b.published) - new Date(article_a.published)
		))

	return { months, current_month, month_articles }
}

export function ArchivePage() {
	const { month: route_month } = useParams()
	const navigate = useNavigate()
	const { articles, is_loading } = useArticles()
	const { t, i18n } = useTranslation()
	const archive_data = useMemo(
		() => getArchiveData(articles, route_month),
		[articles, route_month],
	)
	const { months, current_month, month_articles } = archive_data
	const current_index = months.indexOf(current_month)
	const previous_month = current_index < months.length - 1 ? months[current_index + 1] : null
	const next_month = current_index > 0 ? months[current_index - 1] : null
	const month_label = current_month
		? new Date(`${current_month}-01T12:00:00Z`).toLocaleDateString(
			i18n.language === 'zh' ? 'zh-TW' : 'en-US',
			{ year: 'numeric', month: 'long' },
		)
		: ''

	const handleDownloadMonth = () => {
		const content = month_articles
			.map(article => articleToMarkdown(article, i18n.language))
			.join('\n---\n\n')
		downloadMarkdown(`daily-digest-${current_month}.md`, content)
	}

	if (is_loading) return <div className="page-loading">{t('archive.loading')}</div>

	return (
		<div className="page-shell archive-page">
			<header className="page-intro page-intro--archive">
				<div>
					<p className="eyebrow">{t('archive.eyebrow')}</p>
					<h1>{t('archive.title')}</h1>
				</div>
				<div className="page-intro__aside">
					<p>{t('archive.intro')}</p>
					<label className="archive-select">
						<span>{t('archive.jump_to')}</span>
						<select
							value={current_month}
							onChange={event => navigate(`/archive/${event.target.value}`)}
						>
							{months.map(month => <option key={month}>{month}</option>)}
						</select>
					</label>
				</div>
			</header>

			<section className="archive-issue" aria-labelledby="archive-month">
				<header className="section-heading archive-issue__header">
					<div>
						<span className="section-index">VOL.</span>
						<h2 id="archive-month">{month_label}</h2>
					</div>
					<span>{month_articles.length} {t('archive.articles')}</span>
				</header>

				<div className="archive-list">
					{month_articles.map(article => (
						<ArticleCard key={article.id} article={article} />
					))}
				</div>

				{month_articles.length === 0 && (
					<div className="empty-state">
						<span aria-hidden="true">∅</span>
						<h2>{t('archive.empty_title')}</h2>
						<p>{t('archive.empty')}</p>
					</div>
				)}
			</section>

			<nav className="archive-pagination" aria-label={t('archive.pagination')}>
				{previous_month ? (
					<button
						type="button"
						onClick={() => navigate(`/archive/${previous_month}`)}
					>
						<span aria-hidden="true">←</span> {previous_month}
					</button>
				) : <span />}
				<button
					type="button"
					className="clay-button"
					onClick={handleDownloadMonth}
					disabled={month_articles.length === 0}
				>
					{t('archive.download')} {month_label}
				</button>
				{next_month ? (
					<button
						type="button"
						onClick={() => navigate(`/archive/${next_month}`)}
					>
						{next_month} <span aria-hidden="true">→</span>
					</button>
				) : <span />}
			</nav>
		</div>
	)
}
