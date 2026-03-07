import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { SkipLink } from './components/SkipLink'
import { ToastProvider } from './components/Toast'
import { HomePage } from './pages/HomePage'
import { GraphPage } from './pages/GraphPage'
import { ArchivePage } from './pages/ArchivePage'

export default function App() {
	return (
		<BrowserRouter basename="/daily-digest">
			<ToastProvider>
				<div className="min-h-screen bg-paper dark:bg-paper-dark text-text-primary dark:text-slate-200 font-sans">
					<SkipLink />
					<Navbar />
					<main id="main-content">
						<Routes>
							<Route path="/" element={<HomePage />} />
							<Route path="/graph" element={<GraphPage />} />
							<Route path="/archive" element={<ArchivePage />} />
							<Route path="/archive/:month" element={<ArchivePage />} />
						</Routes>
					</main>
				</div>
			</ToastProvider>
		</BrowserRouter>
	)
}
