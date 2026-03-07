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
		<nav className="fixed top-4 left-4 right-4 z-50 bg-card/70 dark:bg-card-dark/70 backdrop-blur-xl backdrop-saturate-150 border border-border-light/60 dark:border-white/10 rounded-2xl px-4 md:px-6 py-3 shadow-sm">
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
					<button onClick={toggleLang} className="px-3 py-1.5 rounded-md text-sm font-medium text-text-muted hover:text-text-primary dark:hover:text-[#F5F5F7] transition-colors cursor-pointer">
						{i18n.language === 'en' ? 'ZH' : 'EN'}
					</button>
					<ThemeToggle is_dark={is_dark} onToggle={toggleTheme} />
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
					<div className="flex items-center gap-2 mt-2 pt-2 border-t border-border-light dark:border-white/10">
						<button onClick={() => { toggleLang(); setIsMenuOpen(false) }} className="flex-1 py-2 rounded-md text-sm font-medium text-text-muted hover:text-text-primary dark:hover:text-[#F5F5F7] transition-colors cursor-pointer min-h-[44px]">
							{i18n.language === 'en' ? 'ZH' : 'EN'}
						</button>
						<ThemeToggle is_dark={is_dark} onToggle={() => { toggleTheme(); setIsMenuOpen(false) }} />
					</div>
				</div>
			)}
		</nav>
	)
}

function ThemeToggle({ is_dark, onToggle }) {
	return (
		<button
			onClick={onToggle}
			className="relative w-12 h-7 rounded-full transition-colors cursor-pointer focus:ring-2 focus:ring-accent focus:outline-none bg-border-light dark:bg-white/20"
			aria-label="Toggle theme"
		>
			<span
				className={`absolute top-0.5 w-6 h-6 rounded-full bg-white dark:bg-[#1C1C1E] shadow-sm transition-transform duration-200 flex items-center justify-center ${is_dark ? 'translate-x-5.5' : 'translate-x-0.5'}`}
			>
				{is_dark ? (
					<svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
						<path d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
					</svg>
				) : (
					<svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
					</svg>
				)}
			</span>
		</button>
	)
}
