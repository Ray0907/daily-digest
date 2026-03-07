import { useTranslation } from 'react-i18next'
import { PacerBadge } from './PacerBadge'
import { articleToMarkdown, copyToClipboard } from '../lib/export'
import { useToast } from './Toast'

export function FeaturedCard({ article, style = {} }) {
	const { t, i18n } = useTranslation()
	const toast = useToast()

	const summary = i18n.language === 'zh' ? article.summary_zh : article.summary_en

	const handleCopy = async (e) => {
		e.stopPropagation()
		await copyToClipboard(articleToMarkdown(article, i18n.language))
		toast('Copied to clipboard')
	}

	return (
		<article
			className="bg-card dark:bg-card-dark border border-border-light dark:border-slate-800 rounded-xl p-6 md:p-8 transition-all hover:border-accent/30 hover:shadow-md cursor-pointer group focus:ring-2 focus:ring-accent focus:outline-none"
			tabIndex={0}
			style={style}
		>
			<div className="flex items-center gap-2 mb-3">
				<img
					src={`https://www.google.com/s2/favicons?domain=${article.source}&sz=16`}
					alt=""
					className="w-4 h-4"
				/>
				<span className="text-sm text-text-muted dark:text-slate-400">{article.source}</span>
				<span className="text-sm text-text-muted dark:text-slate-400">-</span>
				<span className="text-sm text-text-muted dark:text-slate-400">{getTimeAgo(article.published)}</span>
				<div className="ml-auto">
					<PacerBadge pacer={article.pacer} />
				</div>
			</div>

			<h2 className="font-serif text-xl md:text-2xl font-semibold mb-3 text-text-primary dark:text-slate-200 group-hover:text-accent transition-colors">
				{article.title}
			</h2>

			{summary && (
				<p className="text-sm md:text-base text-text-muted dark:text-slate-400 mb-4 leading-relaxed">
					{summary}
				</p>
			)}

			{article.keywords?.length > 0 && (
				<div className="flex flex-wrap gap-1.5 mb-4">
					{article.keywords.map(kw => (
						<span key={kw} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded">
							#{kw}
						</span>
					))}
				</div>
			)}

			<div className="flex items-center justify-between pt-3 border-t border-border-light dark:border-slate-800">
				<button
					onClick={handleCopy}
					className="text-xs text-text-muted hover:text-accent transition-colors cursor-pointer min-h-[44px] px-2 focus:ring-2 focus:ring-accent focus:outline-none rounded"
				>
					{t('home.copy_md')}
				</button>
				<a
					href={article.url}
					target="_blank"
					rel="noopener noreferrer"
					className="text-xs text-accent hover:underline cursor-pointer min-h-[44px] px-2 flex items-center focus:ring-2 focus:ring-accent focus:outline-none rounded"
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
