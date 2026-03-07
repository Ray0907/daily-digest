import { useTranslation } from 'react-i18next'
import { PacerBadge } from './PacerBadge'
import { articleToMarkdown, copyToClipboard } from '../lib/export'
import { getTimeAgo } from '../lib/time'
import { getFaviconUrl } from '../lib/favicon'
import { useToast } from './Toast'

export function FeaturedCard({ article, style = {}, onPacerToggle, onKeywordSearch }) {
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
			className="bg-card dark:bg-card-dark border border-border-light/60 dark:border-white/10 rounded-2xl p-6 md:p-8 transition-all hover:shadow-lg hover:border-accent/30 cursor-pointer group focus:ring-2 focus:ring-accent focus:outline-none"
			tabIndex={0}
			style={style}
		>
			<div className="flex items-center gap-2 mb-3">
				{getFaviconUrl(article) && <img
					src={getFaviconUrl(article)}
					alt=""
					className="w-4 h-4 shrink-0"
				/>}
				<span className="text-sm text-text-muted dark:text-slate-400 truncate">{article.source}</span>
				<span className="text-sm text-text-muted dark:text-slate-400 shrink-0">-</span>
				<span className="text-sm text-text-muted dark:text-slate-400 shrink-0">{getTimeAgo(article.published)}</span>
				<div className="ml-auto shrink-0">
					<PacerBadge pacer={article.pacer} onClick={onPacerToggle} />
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
						<button
							key={kw}
							onClick={(e) => { e.stopPropagation(); onKeywordSearch?.(kw) }}
							className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded cursor-pointer hover:bg-accent/20 transition-colors"
						>
							#{kw}
						</button>
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
