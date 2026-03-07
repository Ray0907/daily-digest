import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PacerBadge } from './PacerBadge'
import { useToast } from './Toast'
import { articleToMarkdown, copyToClipboard } from '../lib/export'

export function ArticleCard({ article, compact = false, is_read, onRead }) {
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
		<article className={`bg-card dark:bg-card-dark border border-border-light dark:border-slate-800 rounded-lg p-5 transition-colors hover:border-accent/30 cursor-pointer focus:ring-2 focus:ring-accent focus:outline-none animate-[fadeInUp_0.2s_ease-out] ${is_read ? 'opacity-75' : ''}`}>
			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center gap-2 text-sm text-text-muted dark:text-slate-400">
					<img
						src={`https://www.google.com/s2/favicons?domain=${article.source}&sz=16`}
						alt=""
						className="w-4 h-4"
					/>
					<span>{article.source}</span>
					<span>-</span>
					<span>{time_ago}</span>
				</div>
				<PacerBadge pacer={article.pacer} />
			</div>

			<h3 className="font-serif text-lg font-semibold mb-2 text-text-primary dark:text-slate-200">
				{article.title}
			</h3>

			{summary && (
				compact ? (
					<p className="text-sm text-text-muted dark:text-slate-400 mb-3 line-clamp-2">
						{summary}
					</p>
				) : (
					<p
						className={`text-sm text-text-muted dark:text-slate-400 mb-3 ${is_expanded ? '' : 'line-clamp-3'}`}
						onClick={() => setIsExpanded(prev => !prev)}
					>
						{summary}
					</p>
				)
			)}

			{!compact && article.keywords?.length > 0 && (
				<div className="flex flex-wrap gap-1.5 mb-3">
					{article.keywords.map(kw => (
						<span key={kw} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded">
							#{kw}
						</span>
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
