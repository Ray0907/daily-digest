import { lazy, Suspense, useMemo, useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../hooks/useTheme'
import { useDesktopTheme } from '../contexts/DesktopThemeContext'
import { useArticles } from '../hooks/useArticles'
import { articleToMarkdown, downloadMarkdown, copyToClipboard } from '../lib/export'
import { getTimeAgo } from '../lib/time'
import { useToast, ToastProvider } from '../components/Toast'
import { KeyboardHelp } from '../components/KeyboardHelp'
import { SkipLink } from '../components/SkipLink'

const GraphPage = lazy(() => import('../pages/GraphPage').then(m => ({ default: m.GraphPage })))
const ArchivePage = lazy(() => import('../pages/ArchivePage').then(m => ({ default: m.ArchivePage })))

/* ═══════════════════════════════════════════════
   Masthead - the newspaper's banner header
   ═══════════════════════════════════════════════ */
function Masthead() {
	const { t } = useTranslation()
	const today = new Date()
	const date_formatted = today.toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})

	return (
		<header className="newspaper-masthead">
			<p className="newspaper-dateline mb-1">{date_formatted}</p>
			<h1
				className="newspaper-name text-4xl md:text-5xl lg:text-6xl font-black tracking-tight"
				style={{ fontFamily: "'Playfair Display', serif" }}
			>
				The Daily Digest
			</h1>
			<p
				className="mt-1 text-sm"
				style={{
					fontFamily: "'Newsreader', serif",
					fontStyle: 'italic',
					color: 'var(--newspaper-ink-muted)',
				}}
			>
				{t('nav.subtitle')}
			</p>
		</header>
	)
}

/* ═══════════════════════════════════════════════
   Navigation bar - minimal, editorial style
   ═══════════════════════════════════════════════ */
function NewspaperNav() {
	const { t, i18n } = useTranslation()
	const { is_dark, toggleTheme } = useTheme()
	const { setDesktopTheme } = useDesktopTheme()
	const location = useLocation()

	const toggleLang = () => {
		i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en')
	}

	const navItems = [
		{ to: '/', label: t('nav.home') },
		{ to: '/graph', label: t('nav.graph') },
		{ to: '/archive', label: t('nav.archive') },
	]

	return (
		<nav className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between border-b border-t"
			style={{ borderColor: 'var(--newspaper-rule)' }}
		>
			<div className="flex items-center gap-4">
				{navItems.map(({ to, label }) => (
					<Link
						key={to}
						to={to}
						className="newspaper-dateline cursor-pointer transition-colors"
						style={{
							color: location.pathname === to
								? 'var(--newspaper-ink)'
								: 'var(--newspaper-ink-muted)',
							borderBottom: location.pathname === to
								? '2px solid var(--newspaper-accent)'
								: '2px solid transparent',
							paddingBottom: '0.25rem',
						}}
					>
						{label}
					</Link>
				))}
			</div>

			<div className="flex items-center gap-3">
				<button
					onClick={() => setDesktopTheme('modern')}
					className="newspaper-dateline cursor-pointer"
					style={{ color: 'var(--newspaper-ink-muted)' }}
					title="Switch to Modern layout"
				>
					Modern
				</button>
				{/* <button
					onClick={() => setDesktopTheme('win95')}
					className="newspaper-dateline cursor-pointer"
					style={{ color: 'var(--newspaper-ink-muted)' }}
					title="Switch to Windows 95 theme"
				>
					Win95
				</button> */}
				{/* <button
					onClick={() => setDesktopTheme('mac')}
					className="newspaper-dateline cursor-pointer"
					style={{ color: 'var(--newspaper-ink-muted)' }}
					title="Switch to Classic Mac theme"
				>
					Mac
				</button> */}
				<span style={{ color: 'var(--newspaper-rule)' }}>|</span>
				<button
					onClick={toggleLang}
					className="newspaper-dateline cursor-pointer"
					style={{ color: 'var(--newspaper-ink-muted)' }}
				>
					{i18n.language === 'en' ? 'ZH' : 'EN'}
				</button>
				<button
					onClick={toggleTheme}
					className="newspaper-dateline cursor-pointer"
					style={{ color: 'var(--newspaper-ink-muted)' }}
					aria-label="Toggle theme"
				>
					{is_dark ? 'Light' : 'Dark'}
				</button>
			</div>
		</nav>
	)
}

/* ═══════════════════════════════════════════════
   Filter bar - newspaper-styled search & filters
   ═══════════════════════════════════════════════ */
function NewspaperFilterBar({ search_query, onSearchChange, active_pacers, onPacerToggle, sources, active_source, onSourceChange }) {
	const { t } = useTranslation()

	const PACER_KEYS = ['P', 'A', 'C', 'E', 'R']

	return (
		<div className="mb-6 space-y-3">
			<div className="relative">
				<svg
					className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4"
					style={{ color: 'var(--newspaper-ink-muted)' }}
					fill="none" stroke="currentColor" viewBox="0 0 24 24"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
				<input
					type="text"
					value={search_query}
					onChange={e => onSearchChange(e.target.value)}
					placeholder={t('home.search_placeholder') || 'Search the archives...'}
					className="newspaper-search w-full"
					id="search-input"
				/>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				{PACER_KEYS.map(key => (
					<button
						key={key}
						onClick={() => onPacerToggle(key)}
						className={`newspaper-filter ${active_pacers.has(key) ? 'active' : ''}`}
					>
						{key} - {t(`pacer.${key}`)}
					</button>
				))}

				{sources.length > 0 && (
					<select
						value={active_source}
						onChange={e => onSourceChange(e.target.value)}
						className="newspaper-filter ml-auto"
						style={{ appearance: 'auto' }}
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

/* ═══════════════════════════════════════════════
   Lead article - the big headline story
   ═══════════════════════════════════════════════ */
function LeadArticle({ article, onKeywordSearch }) {
	const { t, i18n } = useTranslation()
	const toast = useToast()
	const summary = i18n.language === 'zh' ? article.summary_zh : article.summary_en

	const handleCopy = async () => {
		await copyToClipboard(articleToMarkdown(article, i18n.language))
		toast('Copied to clipboard')
	}

	return (
		<article className="mb-6 pb-6" style={{ borderBottom: '1px solid var(--newspaper-rule)' }}>
			<div className="flex items-center gap-2 mb-2">
				<span className="newspaper-byline">
					{article.source} &mdash; {getTimeAgo(article.published)}
				</span>
				<span className="ml-auto newspaper-pacer">
					{article.pacer}
				</span>
			</div>

			<h2 className="headline-primary mb-3">
				{article.title}
			</h2>

			{summary && (
				<p className="newspaper-body newspaper-dropcap mb-3" style={{ maxWidth: '65ch' }}>
					{summary}
				</p>
			)}

			{article.keywords?.length > 0 && (
				<div className="flex flex-wrap gap-1.5 mb-3">
					{article.keywords.map(kw => (
						<button
							key={kw}
							onClick={() => onKeywordSearch?.(kw)}
							className="newspaper-tag"
						>
							{kw}
						</button>
					))}
				</div>
			)}

			<div className="flex items-center gap-4">
				<button
					onClick={handleCopy}
					className="newspaper-link cursor-pointer text-sm"
					style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic' }}
				>
					{t('home.copy_md')}
				</button>
				<a
					href={article.url}
					target="_blank"
					rel="noopener noreferrer"
					className="newspaper-link text-sm"
					style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic' }}
				>
					{t('home.read')} &rarr;
				</a>
			</div>
		</article>
	)
}

/* ═══════════════════════════════════════════════
   Column article - fits inside CSS columns
   ═══════════════════════════════════════════════ */
function ColumnArticle({ article, onKeywordSearch }) {
	const { t, i18n } = useTranslation()
	const toast = useToast()
	const summary = i18n.language === 'zh' ? article.summary_zh : article.summary_en

	const handleCopy = async () => {
		await copyToClipboard(articleToMarkdown(article, i18n.language))
		toast('Copied to clipboard')
	}

	return (
		<article className="newspaper-article">
			<div className="flex items-center justify-between gap-2 mb-1.5">
				<span className="newspaper-byline truncate">
					{article.source} &mdash; {getTimeAgo(article.published)}
				</span>
				<span className="newspaper-pacer shrink-0">
					{article.pacer}
				</span>
			</div>

			<h3 className="headline-secondary mb-2">
				{article.title}
			</h3>

			{summary && (
				<p className="newspaper-body mb-2 line-clamp-4">
					{summary}
				</p>
			)}

			{article.keywords?.length > 0 && (
				<div className="flex flex-wrap gap-1 mb-2">
					{article.keywords.slice(0, 3).map(kw => (
						<button
							key={kw}
							onClick={() => onKeywordSearch?.(kw)}
							className="newspaper-tag"
						>
							{kw}
						</button>
					))}
				</div>
			)}

			<div className="flex items-center gap-3">
				<button
					onClick={handleCopy}
					className="newspaper-link cursor-pointer text-xs"
					style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic' }}
				>
					{t('home.copy_md')}
				</button>
				<a
					href={article.url}
					target="_blank"
					rel="noopener noreferrer"
					className="newspaper-link text-xs"
					style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic' }}
				>
					{t('home.read')} &rarr;
				</a>
			</div>
		</article>
	)
}

/* ═══════════════════════════════════════════════
   Newspaper Home Page
   ═══════════════════════════════════════════════ */
function NewspaperHome() {
	const { articles, is_loading } = useArticles()
	const { t, i18n } = useTranslation()

	const [search_query, setSearchQuery] = useState('')
	const [active_pacers, setActivePacers] = useState(new Set())
	const [active_source, setActiveSource] = useState('')

	const handlePacerToggle = useCallback((pacer, opts) => {
		setActivePacers(prev => {
			if (opts?.exclusive) {
				if (prev.size === 1 && prev.has(pacer)) return new Set()
				return new Set([pacer])
			}
			const next = new Set(prev)
			if (next.has(pacer)) next.delete(pacer)
			else next.add(pacer)
			return next
		})
	}, [])

	const three_days_ago = useMemo(() => Date.now() - 3 * 24 * 3600 * 1000, [])

	const sources = useMemo(() => {
		const set = new Set(articles.map(a => a.source))
		return [...set].sort()
	}, [articles])

	const filtered = useMemo(() => {
		const matched = articles
			.filter(a => new Date(a.published).getTime() > three_days_ago)
			.filter(a => {
				if (search_query) {
					const q = search_query.toLowerCase()
					const matches = (a.title || '').toLowerCase().includes(q)
						|| (a.summary_en || '').toLowerCase().includes(q)
						|| (a.summary_zh || '').toLowerCase().includes(q)
						|| (a.keywords || []).some(k => k.toLowerCase().includes(q))
					if (!matches) return false
				}
				if (active_pacers.size > 0 && !active_pacers.has(a.pacer)) return false
				if (active_source && a.source !== active_source) return false
				return true
			})

		const buckets = {}
		for (const a of matched) {
			if (!buckets[a.source]) buckets[a.source] = []
			buckets[a.source].push(a)
		}
		for (const key of Object.keys(buckets)) {
			buckets[key].sort((a, b) => new Date(b.published) - new Date(a.published))
		}

		const source_lists = Object.values(buckets)
		const result = []
		const max_len = Math.max(0, ...source_lists.map(s => s.length))
		for (let i = 0; i < max_len; i++) {
			for (const list of source_lists) {
				if (i < list.length) result.push(list[i])
			}
		}
		return result
	}, [articles, search_query, active_pacers, active_source])

	const grouped = useMemo(() => {
		const groups = {}
		for (const article of filtered) {
			const date_key = new Date(article.published).toLocaleDateString('en-US', {
				year: 'numeric', month: 'long', day: 'numeric',
			})
			if (!groups[date_key]) groups[date_key] = []
			groups[date_key].push(article)
		}
		return groups
	}, [filtered])

	const handleDownloadToday = () => {
		const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
		const today_articles = grouped[today] || []
		const content = today_articles.map(a => articleToMarkdown(a, i18n.language)).join('\n---\n\n')
		downloadMarkdown(`daily-digest-${new Date().toISOString().slice(0, 10)}.md`, content)
	}

	const handleDownloadWeek = () => {
		const content = filtered.map(a => articleToMarkdown(a, i18n.language)).join('\n---\n\n')
		downloadMarkdown(`daily-digest-week-${new Date().toISOString().slice(0, 10)}.md`, content)
	}

	if (is_loading) {
		return (
			<div className="max-w-5xl mx-auto px-4 py-8">
				<div className="space-y-6">
					{[1, 2, 3].map(i => (
						<div key={i} className="animate-pulse" style={{ borderBottom: '1px solid var(--newspaper-rule)' }}>
							<div className="h-4 w-32 mb-2 rounded" style={{ background: 'var(--newspaper-rule)' }} />
							<div className="h-6 w-3/4 mb-2 rounded" style={{ background: 'var(--newspaper-rule)' }} />
							<div className="h-4 w-full mb-2 rounded" style={{ background: 'var(--newspaper-rule)' }} />
							<div className="h-4 w-2/3 mb-4 rounded" style={{ background: 'var(--newspaper-rule)' }} />
						</div>
					))}
				</div>
			</div>
		)
	}

	return (
		<div className="max-w-5xl mx-auto px-4 py-6">
			<NewspaperFilterBar
				search_query={search_query}
				onSearchChange={setSearchQuery}
				active_pacers={active_pacers}
				onPacerToggle={handlePacerToggle}
				sources={sources}
				active_source={active_source}
				onSourceChange={setActiveSource}
			/>

			{Object.entries(grouped).map(([date, date_articles], group_idx) => (
				<section key={date} className="mb-8">
					{/* Section date header */}
					<div className="flex items-center gap-4 mb-4">
						<hr className="rule-thin flex-1" />
						<span className="newspaper-dateline shrink-0">
							{formatDateLabel(date, t)}
						</span>
						<span className="newspaper-dateline shrink-0">
							{date_articles.length} {t('home.posts')}
						</span>
						<hr className="rule-thin flex-1" />
					</div>

					{/* Lead article for first group */}
					{group_idx === 0 && date_articles.length >= 2 && (
						<LeadArticle
							article={date_articles[0]}
							onKeywordSearch={setSearchQuery}
						/>
					)}

					{/* Remaining articles in columns */}
					<div className="newspaper-columns">
						{(group_idx === 0 && date_articles.length >= 2
							? date_articles.slice(1)
							: date_articles
						).map((article) => (
							<ColumnArticle
								key={article.id}
								article={article}
								onKeywordSearch={setSearchQuery}
							/>
						))}
					</div>

					{/* Ornamental divider between sections */}
					{group_idx < Object.keys(grouped).length - 1 && (
						<div className="newspaper-ornament">&bull; &bull; &bull;</div>
					)}
				</section>
			))}

			{Object.keys(grouped).length === 0 && (
				<p className="text-center py-12" style={{
					fontFamily: "'Newsreader', serif",
					fontStyle: 'italic',
					color: 'var(--newspaper-ink-muted)',
				}}>
					{search_query || active_pacers.size > 0 || active_source
						? (t('home.no_results') || 'No articles match your filters. Try adjusting your search.')
						: 'No articles from the last 7 days.'}
				</p>
			)}

			{filtered.length > 0 && (
				<div className="flex gap-4 mt-6 pt-4" style={{ borderTop: '1px solid var(--newspaper-rule)' }}>
					<button
						onClick={handleDownloadToday}
						className="newspaper-link cursor-pointer text-sm"
						style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic' }}
					>
						{t('home.download_today')}
					</button>
					<button
						onClick={handleDownloadWeek}
						className="newspaper-link cursor-pointer text-sm"
						style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic' }}
					>
						{t('home.download_week')}
					</button>
				</div>
			)}

			{/* Footer */}
			<footer className="mt-12 pt-4 text-center" style={{ borderTop: '3px double var(--newspaper-rule)' }}>
				<p className="newspaper-dateline">
					Est. 2025 &mdash; Published with care
				</p>
			</footer>
		</div>
	)
}

function formatDateLabel(date_str, t) {
	const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
	const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
	if (date_str === today) return t('home.today')
	if (date_str === yesterday) return t('home.yesterday')
	return date_str
}

/* ═══════════════════════════════════════════════
   Main Layout Shell
   ═══════════════════════════════════════════════ */
export function NewspaperLayout() {
	return (
		<BrowserRouter basename="/daily-digest">
			<ToastProvider>
				<div className="newspaper-shell">
					<SkipLink />
					<div className="max-w-5xl mx-auto px-4">
						<Masthead />
					</div>
					<NewspaperNav />
					<main id="main-content">
						<Suspense fallback={
							<div className="max-w-5xl mx-auto px-4 py-8"
								style={{ fontFamily: "'Newsreader', serif", fontStyle: 'italic', color: 'var(--newspaper-ink-muted)' }}
							>
								Loading...
							</div>
						}>
							<Routes>
								<Route path="/" element={<NewspaperHome />} />
								<Route path="/graph" element={<GraphPage />} />
								<Route path="/archive" element={<ArchivePage />} />
								<Route path="/archive/:month" element={<ArchivePage />} />
							</Routes>
						</Suspense>
					</main>
					<KeyboardHelp />
				</div>
			</ToastProvider>
		</BrowserRouter>
	)
}
