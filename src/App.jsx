import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useArticles } from './hooks/useArticles'
import { Bookshelf } from './components/Bookshelf'

const GraphPage = lazy(() => import('./pages/GraphPage').then(m => ({ default: m.GraphPage })))
const ArchivePage = lazy(() => import('./pages/ArchivePage').then(m => ({ default: m.ArchivePage })))

function ShelfHome() {
	const { articles, is_loading } = useArticles()
	return (
		<>
			<header className="shelf-header">
				<h1>Daily Digest</h1>
				<p>Ideas for progress · scroll down</p>
			</header>
			<nav className="shelf-nav">
				<Link to="/graph">Graph</Link>
				<Link to="/archive">Archive</Link>
			</nav>
			{!is_loading && <Bookshelf articles={articles} />}
		</>
	)
}

export default function App() {
	return (
		<BrowserRouter basename="/daily-digest">
			<Suspense fallback={<div className="shelf-loading">Loading…</div>}>
				<Routes>
					<Route path="/" element={<ShelfHome />} />
					<Route path="/graph" element={<GraphPage />} />
					<Route path="/archive" element={<ArchivePage />} />
					<Route path="/archive/:month" element={<ArchivePage />} />
				</Routes>
			</Suspense>
		</BrowserRouter>
	)
}
