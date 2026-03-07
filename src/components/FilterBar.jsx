import { useTranslation } from 'react-i18next'

const PACER_FILTERS = [
	{ key: 'P', color: 'bg-pacer-p/15 text-pacer-p border-pacer-p/30' },
	{ key: 'A', color: 'bg-pacer-a/15 text-pacer-a border-pacer-a/30' },
	{ key: 'C', color: 'bg-pacer-c/15 text-pacer-c border-pacer-c/30' },
	{ key: 'E', color: 'bg-pacer-e/15 text-pacer-e border-pacer-e/30' },
	{ key: 'R', color: 'bg-pacer-r/15 text-pacer-r border-pacer-r/30' },
]

export function FilterBar({ search_query, onSearchChange, active_pacers, onPacerToggle, sources, active_source, onSourceChange }) {
	const { t } = useTranslation()

	return (
		<div className="mb-6 space-y-3">
			<div className="relative">
				<svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
				<input
					type="text"
					value={search_query}
					onChange={e => onSearchChange(e.target.value)}
					placeholder={t('home.search_placeholder') || 'Search articles...'}
					className="w-full pl-10 pr-4 py-2.5 bg-card dark:bg-card-dark border border-border-light dark:border-slate-800 rounded-lg text-sm text-text-primary dark:text-slate-200 placeholder-text-muted focus:ring-2 focus:ring-accent focus:border-transparent focus:outline-none transition-colors"
					id="search-input"
				/>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				{PACER_FILTERS.map(({ key, color }) => (
					<button
						key={key}
						onClick={() => onPacerToggle(key)}
						className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer min-h-[36px] focus:ring-2 focus:ring-accent focus:outline-none
							${active_pacers.has(key) ? color : 'bg-transparent border-border-light dark:border-slate-700 text-text-muted hover:text-text-primary dark:hover:text-slate-200'}`}
					>
						{key} - {t(`pacer.${key}`)}
					</button>
				))}

				{sources.length > 0 && (
					<select
						value={active_source}
						onChange={e => onSourceChange(e.target.value)}
						className="ml-auto px-3 py-1.5 bg-card dark:bg-card-dark border border-border-light dark:border-slate-800 rounded-md text-xs text-text-muted cursor-pointer min-h-[36px] focus:ring-2 focus:ring-accent focus:outline-none"
					>
						<option value="">{t('home.all_sources') || 'All Sources'}</option>
						{sources.map(s => (
							<option key={s} value={s}>{s}</option>
						))}
					</select>
				)}
			</div>
		</div>
	)
}
