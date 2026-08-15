import { lazy, Suspense, useEffect } from 'react'
import {
	BrowserRouter,
	NavLink,
	Route,
	Routes,
	useLocation,
} from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { HomePage } from './pages/HomePage'
import { SkipLink } from './components/SkipLink'
import { ToastProvider } from './components/Toast'

const GraphPage = lazy(() => (
	import('./pages/GraphPage').then(module => ({ default: module.GraphPage }))
))
const ArchivePage = lazy(() => (
	import('./pages/ArchivePage').then(module => ({ default: module.ArchivePage }))
))

const NAV_ITEMS = [
	{ to: '/', key: 'home' },
	{ to: '/graph', key: 'graph' },
	{ to: '/archive', key: 'archive' },
]

function SiteHeader() {
	const { t, i18n } = useTranslation()
	const next_language = i18n.language === 'zh' ? 'en' : 'zh'

	return (
		<header className="site-header">
			<div className="site-header__inner">
				<NavLink className="wordmark" to="/" aria-label="Daily Digest home">
					<span className="wordmark__monogram" aria-hidden="true">D</span>
					<span>Daily Digest</span>
				</NavLink>

				<nav className="primary-nav" aria-label="Primary navigation">
					{NAV_ITEMS.map(item => (
						<NavLink
							key={item.key}
							to={item.to}
							end={item.to === '/'}
							className={({ isActive }) => (
								`primary-nav__link${isActive ? ' is-active' : ''}`
							)}
						>
							{t(`nav.${item.key}`)}
						</NavLink>
					))}
				</nav>

				<div className="site-actions">
					<button
						type="button"
						className="language-button"
						onClick={() => i18n.changeLanguage(next_language)}
						aria-label={t('nav.switch_language')}
					>
						{i18n.language === 'zh' ? 'EN' : '中'}
					</button>
					<a className="rss-button" href={`${import.meta.env.BASE_URL}feed.xml`}>
						RSS <span aria-hidden="true">↗</span>
					</a>
				</div>
			</div>
		</header>
	)
}

function SiteFooter() {
	const { t } = useTranslation()

	return (
		<footer className="site-footer">
			<div className="site-footer__inner">
				<div className="site-footer__statement">
					<p className="footer-kicker">Daily Digest / Field notes</p>
					<p>{t('footer.statement')}</p>
				</div>
				<div className="footer-links">
					<div>
						<p className="footer-heading">{t('footer.explore')}</p>
						<NavLink to="/">{t('nav.home')}</NavLink>
						<NavLink to="/graph">{t('nav.graph')}</NavLink>
						<NavLink to="/archive">{t('nav.archive')}</NavLink>
					</div>
					<div>
						<p className="footer-heading">{t('footer.project')}</p>
						<a href={`${import.meta.env.BASE_URL}feed.xml`}>RSS feed</a>
						<a href="https://github.com/Ray0907/daily-digest">GitHub</a>
					</div>
				</div>
			</div>
			<div className="site-footer__base">
				<span>© {new Date().getFullYear()} Daily Digest</span>
				<span>{t('footer.crafted')}</span>
			</div>
		</footer>
	)
}

function ScrollToTop() {
	const { pathname } = useLocation()

	useEffect(() => {
		window.scrollTo(0, 0)
	}, [pathname])

	return null
}

function AppRoutes() {
	return (
		<>
			<ScrollToTop />
			<SkipLink />
			<SiteHeader />
			<main id="main-content">
				<Suspense fallback={<div className="page-loading">Loading field notes…</div>}>
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route path="/graph" element={<GraphPage />} />
						<Route path="/archive" element={<ArchivePage />} />
						<Route path="/archive/:month" element={<ArchivePage />} />
					</Routes>
				</Suspense>
			</main>
			<SiteFooter />
		</>
	)
}

export default function App() {
	return (
		<BrowserRouter basename="/daily-digest">
			<ToastProvider>
				<AppRoutes />
			</ToastProvider>
		</BrowserRouter>
	)
}
