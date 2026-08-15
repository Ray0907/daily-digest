import { useTranslation } from 'react-i18next'

const PACER_FILTERS = ['P', 'A', 'C', 'E', 'R']

export function FilterBar({
	search_query,
	onSearchChange,
	active_pacers,
	onPacerToggle,
	sources,
	active_source,
	onSourceChange,
}) {
	const { t } = useTranslation()

	return (
		<section className="filter-bar" aria-label={t('home.filter_label')}>
			<label className="search-field" htmlFor="search-input">
				<svg viewBox="0 0 24 24" aria-hidden="true">
					<circle cx="11" cy="11" r="6.75" />
					<path d="m16 16 4.25 4.25" />
				</svg>
				<span className="sr-only">{t('home.search_placeholder')}</span>
				<input
					id="search-input"
					type="search"
					value={search_query}
					onChange={event => onSearchChange(event.target.value)}
					placeholder={t('home.search_placeholder')}
				/>
			</label>

			<div className="filter-bar__controls">
				<div className="pacer-filters" aria-label="PACER filters">
					{PACER_FILTERS.map(key => (
						<button
							type="button"
							key={key}
							className={active_pacers.has(key) ? 'is-active' : ''}
							onClick={() => onPacerToggle(key)}
							aria-pressed={active_pacers.has(key)}
						>
							<span>{key}</span> {t(`pacer.${key}`)}
						</button>
					))}
				</div>

				{sources.length > 0 && (
					<label className="source-filter">
						<span className="sr-only">{t('home.all_sources')}</span>
						<select
							value={active_source}
							onChange={event => onSourceChange(event.target.value)}
						>
							<option value="">{t('home.all_sources')}</option>
							{sources.map(source => (
								<option key={source} value={source}>{source}</option>
							))}
						</select>
						<span aria-hidden="true">⌄</span>
					</label>
				)}
			</div>
		</section>
	)
}
