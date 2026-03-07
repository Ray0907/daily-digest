import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../hooks/useTheme'

export function Navbar() {
	const { t, i18n } = useTranslation()
	const { is_dark, toggleTheme } = useTheme()
	const location = useLocation()
	const [is_menu_open, setIsMenuOpen] = useState(false)

	const toggleLang = () => {
		i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en')
	}

	const navLink = (to, label, mobile = false) => (
		<Link
			to={to}
			onClick={() => setIsMenuOpen(false)}
			className={`${mobile ? 'block w-full py-2' : ''} px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer
				${location.pathname === to
					? 'bg-accent/10 text-accent'
					: 'text-text-muted hover:text-text-primary dark:hover:text-slate-200'}`}
		>
			{label}
		</Link>
	)

	return (
		<nav className="fixed top-4 left-4 right-4 z-50 bg-card/80 dark:bg-card-dark/80 backdrop-blur-md border border-border-light dark:border-slate-800 rounded-xl px-4 md:px-6 py-3 shadow-sm">
			<div className="max-w-5xl mx-auto flex items-center justify-between">
				<div className="min-w-0">
					<Link to="/" className="font-serif text-lg md:text-xl font-semibold text-text-primary dark:text-slate-200 cursor-pointer">
						Daily Digest
					</Link>
					<p className="text-[10px] md:text-xs text-text-muted dark:text-slate-400 truncate">
						{t('nav.subtitle')}
					</p>
				</div>

				{/* Desktop nav */}
				<div className="hidden md:flex items-center gap-2">
					{navLink('/', t('nav.home'))}
					{navLink('/graph', t('nav.graph'))}
					{navLink('/archive', t('nav.archive'))}
					<button onClick={toggleLang} className="px-3 py-1.5 rounded-md text-sm font-medium text-text-muted hover:text-text-primary dark:hover:text-slate-200 transition-colors cursor-pointer">
						{i18n.language === 'en' ? 'ZH' : 'EN'}
					</button>
					<button onClick={toggleTheme} className="px-3 py-1.5 rounded-md text-sm text-text-muted hover:text-text-primary dark:hover:text-slate-200 transition-colors cursor-pointer" aria-label="Toggle theme">
						{is_dark ? 'Light' : 'Dark'}
					</button>
				</div>

				{/* Mobile hamburger */}
				<button
					onClick={() => setIsMenuOpen(prev => !prev)}
					className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-text-muted hover:text-text-primary dark:hover:text-slate-200 cursor-pointer"
					aria-label="Toggle menu"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						{is_menu_open
							? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
						}
					</svg>
				</button>
			</div>

			{/* Mobile menu */}
			{is_menu_open && (
				<div className="md:hidden mt-3 pt-3 border-t border-border-light dark:border-slate-800">
					{navLink('/', t('nav.home'), true)}
					{navLink('/graph', t('nav.graph'), true)}
					{navLink('/archive', t('nav.archive'), true)}
					<div className="flex gap-2 mt-2 pt-2 border-t border-border-light dark:border-slate-800">
						<button onClick={() => { toggleLang(); setIsMenuOpen(false) }} className="flex-1 py-2 rounded-md text-sm font-medium text-text-muted hover:text-text-primary dark:hover:text-slate-200 transition-colors cursor-pointer min-h-[44px]">
							{i18n.language === 'en' ? 'ZH' : 'EN'}
						</button>
						<button onClick={() => { toggleTheme(); setIsMenuOpen(false) }} className="flex-1 py-2 rounded-md text-sm text-text-muted hover:text-text-primary dark:hover:text-slate-200 transition-colors cursor-pointer min-h-[44px]" aria-label="Toggle theme">
							{is_dark ? 'Light' : 'Dark'}
						</button>
					</div>
				</div>
			)}
		</nav>
	)
}
