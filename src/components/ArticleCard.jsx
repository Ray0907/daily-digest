import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PacerBadge } from './PacerBadge'
import { useToast } from './Toast'
import { articleToMarkdown, copyToClipboard } from '../lib/export'

export function ArticleCard({ article, compact = false, is_read, onRead, onPacerToggle, onKeywordSearch }) {
	const { t, i18n } = useTranslation()
	const [is_expanded, setIsExpanded] = useState(false)
	const toast = useToast()

	const summary = i18n.language === 'zh' ? article.summary_zh : article.summary_en
	const time_ago = getTimeAgo(article.published)

	const handleCopy = async () => {
		await copyToClipboard(articleToMarkdown(article, i18n.language))
		toast('Copied to clipboard')
	}

	return (
		<article className={`bg-card dark:bg-card-dark border border-border-light/60 dark:border-white/10 rounded-2xl p-5 transition-all hover:shadow-md hover:border-accent/30 cursor-pointer focus:ring-2 focus:ring-accent focus:outline-none ${is_read ? 'opacity-60' : ''}`}>
			<div className="flex items-center justify-between gap-2 mb-2">
				<div className="flex items-center gap-2 text-sm text-text-muted dark:text-slate-400 min-w-0">
					<img
						src={`https://www.google.com/s2/favicons?domain=${article.source}&sz=16`}
						alt=""
						className="w-4 h-4 shrink-0"
					/>
					<span className="truncate">{article.source}</span>
					<span className="shrink-0">-</span>
					<span className="shrink-0">{time_ago}</span>
				</div>
				<PacerBadge pacer={article.pacer} compact={compact} onClick={onPacerToggle} />
			</div>

			<h3 className="font-serif text-lg font-semibold mb-2 text-text-primary dark:text-slate-200">
				{article.title}
			</h3>

			{summary && (
				<p
					className={`text-sm text-text-muted dark:text-slate-400 mb-3 ${is_expanded ? '' : compact ? 'line-clamp-2' : 'line-clamp-3'}`}
					onClick={() => setIsExpanded(prev => !prev)}
				>
					{summary}
				</p>
			)}

			{article.keywords?.length > 0 && (
				<div className="flex flex-wrap gap-1.5 mb-3">
					{(compact ? article.keywords.slice(0, 3) : article.keywords).map(kw => (
						<button
							key={kw}
							onClick={() => onKeywordSearch?.(kw)}
							className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded cursor-pointer hover:bg-accent/20 transition-colors"
						>
							#{kw}
						</button>
					))}
				</div>
			)}

			<div className="flex items-center justify-between">
				<button
					onClick={handleCopy}
					className="text-xs text-text-muted hover:text-accent transition-colors cursor-pointer min-h-[44px] focus:ring-2 focus:ring-accent focus:outline-none rounded"
				>
					{t('home.copy_md')}
				</button>
				<a
					href={article.url}
					target="_blank"
					rel="noopener noreferrer"
					onClick={() => onRead?.(article.id)}
					className="text-xs text-accent hover:underline cursor-pointer min-h-[44px] flex items-center focus:ring-2 focus:ring-accent focus:outline-none rounded"
				>
					{t('home.read')} &rarr;
				</a>
			</div>
		</article>
	)
}

function getTimeAgo(date_str) {
	const diff = Date.now() - new Date(date_str).getTime()
	const hours = Math.floor(diff / 3600000)
	if (hours < 1) return 'just now'
	if (hours < 24) return `${hours}h ago`
	const days = Math.floor(hours / 24)
	if (days === 1) return '1d ago'
	return `${days}d ago`
}
