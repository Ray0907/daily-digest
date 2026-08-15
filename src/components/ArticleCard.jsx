import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PacerBadge } from './PacerBadge'
import { useToast } from './toast-context'
import { articleToMarkdown, copyToClipboard } from '../lib/export'
import { getTimeAgo } from '../lib/time'

export function ArticleCard({
	article,
	compact = false,
	is_read,
	onRead,
	onPacerToggle,
	onKeywordSearch,
}) {
	const { t, i18n } = useTranslation()
	const [is_expanded, setIsExpanded] = useState(false)
	const showToast = useToast()
	const summary = i18n.language === 'zh' ? article.summary_zh : article.summary_en

	const handleCopy = async () => {
		await copyToClipboard(articleToMarkdown(article, i18n.language))
		showToast(t('home.copied'))
	}

	return (
		<article
			className={[
				'article-card',
				compact ? 'article-card--compact' : '',
				is_read ? 'is-read' : '',
			].filter(Boolean).join(' ')}
		>
			<div className="article-meta">
				<div>
					<span>{article.source}</span>
					<span aria-hidden="true">·</span>
					<time dateTime={article.published}>{getTimeAgo(article.published)}</time>
				</div>
				<PacerBadge
					pacer={article.pacer}
					compact={compact}
					onClick={onPacerToggle}
				/>
			</div>

			<h3>{article.title}</h3>

			{summary && (
				<button
					type="button"
					className={`article-summary${is_expanded ? ' is-expanded' : ''}`}
					onClick={() => setIsExpanded(current => !current)}
					aria-expanded={is_expanded}
				>
					{summary}
				</button>
			)}

			{article.keywords?.length > 0 && (
				<div className="keyword-list" aria-label="Keywords">
					{(compact ? article.keywords.slice(0, 3) : article.keywords).map(keyword => (
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

			<div className="article-actions">
				<button type="button" onClick={handleCopy}>
					{t('home.copy_md')}
				</button>
				<a
					href={article.url}
					target="_blank"
					rel="noopener noreferrer"
					onClick={() => onRead?.(article.id)}
				>
					{t('home.read')} <span aria-hidden="true">↗</span>
				</a>
			</div>
		</article>
	)
}
