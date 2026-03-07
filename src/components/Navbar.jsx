import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../hooks/useTheme'

export function Navbar() {
	const { t, i18n } = useTranslation()
	const { is_dark, toggleTheme } = useTheme()
	const location = useLocation()

	const toggleLang = () => {
		i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en')
	}

	const navLink = (to, label) => (
		<Link
			to={to}
			className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer
				${location.pathname === to
					? 'bg-accent/10 text-accent'
					: 'text-text-muted hover:text-text-primary dark:hover:text-slate-200'}`}
		>
			{label}
		</Link>
	)

	return (
		<nav className="fixed top-4 left-4 right-4 z-50 bg-card/80 dark:bg-card-dark/80 backdrop-blur-md border border-border-light dark:border-slate-800 rounded-xl px-6 py-3 shadow-sm">
			<div className="max-w-5xl mx-auto flex items-center justify-between">
				<div>
					<Link to="/" className="font-serif text-xl font-semibold text-text-primary dark:text-slate-200 cursor-pointer">
						Daily Digest
					</Link>
					<p className="text-xs text-text-muted dark:text-slate-400">
						{t('nav.subtitle')}
					</p>
				</div>

				<div className="flex items-center gap-2">
					{navLink('/', t('nav.home'))}
					{navLink('/graph', t('nav.graph'))}
					{navLink('/archive', t('nav.archive'))}

					<button
						onClick={toggleLang}
						className="px-3 py-1.5 rounded-md text-sm font-medium text-text-muted hover:text-text-primary dark:hover:text-slate-200 transition-colors cursor-pointer"
					>
						{i18n.language === 'en' ? 'ZH' : 'EN'}
					</button>

					<button
						onClick={toggleTheme}
						className="px-3 py-1.5 rounded-md text-sm text-text-muted hover:text-text-primary dark:hover:text-slate-200 transition-colors cursor-pointer"
						aria-label="Toggle theme"
					>
						{is_dark ? 'Light' : 'Dark'}
					</button>
				</div>
			</div>
		</nav>
	)
}
