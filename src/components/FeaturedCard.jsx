import { useTranslation } from 'react-i18next'
import { PacerBadge } from './PacerBadge'
import { useToast } from './toast-context'
import { articleToMarkdown, copyToClipboard } from '../lib/export'
import { getTimeAgo } from '../lib/time'

function SpecimenIllustration() {
	return (
		<svg
			className="specimen-illustration"
			viewBox="0 0 280 300"
			aria-hidden="true"
		>
			<path d="M140 57v172M140 100c-35-61-89-55-91-18-2 30 41 50 91 57" />
			<path d="M140 100c35-61 89-55 91-18 2 30-41 50-91 57" />
			<path d="M140 137c-46-26-82-3-72 27 9 28 42 37 72 17" />
			<path d="M140 137c46-26 82-3 72 27-9 28-42 37-72 17" />
			<path d="M128 59c0-16 6-29 12-29s12 13 12 29" />
			<path d="M135 30 123 12M145 30l12-18M139 228c-9 16-20 28-34 36" />
			<path d="M141 228c9 16 20 28 34 36" />
			<circle cx="140" cy="137" r="5" />
			<circle cx="82" cy="90" r="3" />
			<circle cx="198" cy="90" r="3" />
			<text x="14" y="286">FIG. 01 / DAILY OBSERVATION</text>
		</svg>
	)
}

export function FeaturedCard({ article, onPacerToggle, onKeywordSearch }) {
	const { t, i18n } = useTranslation()
	const showToast = useToast()
	const summary = i18n.language === 'zh' ? article.summary_zh : article.summary_en

	const handleCopy = async () => {
		await copyToClipboard(articleToMarkdown(article, i18n.language))
		showToast(t('home.copied'))
	}

	return (
		<article className="featured-card">
			<div className="featured-card__content">
				<div className="article-meta">
					<div>
						<span>{article.source}</span>
						<span aria-hidden="true">·</span>
						<time dateTime={article.published}>{getTimeAgo(article.published)}</time>
					</div>
					<PacerBadge pacer={article.pacer} onClick={onPacerToggle} />
				</div>

				<p className="featured-label">{t('home.featured_observation')}</p>
				<h2>{article.title}</h2>
				{summary && <p className="featured-summary">{summary}</p>}

				{article.keywords?.length > 0 && (
					<div className="keyword-list" aria-label="Keywords">
						{article.keywords.map(keyword => (
							<button
								type="button"
								key={keyword}
								onClick={() => onKeywordSearch?.(keyword)}
							>
								#{keyword}
							</button>
						))}
					</div>
				)}

				<div className="article-actions featured-card__actions">
					<button type="button" onClick={handleCopy}>{t('home.copy_md')}</button>
					<a href={article.url} target="_blank" rel="noopener noreferrer">
						{t('home.read')} <span aria-hidden="true">↗</span>
					</a>
				</div>
			</div>
			<div className="featured-card__specimen">
				<SpecimenIllustration />
			</div>
		</article>
	)
}
