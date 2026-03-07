import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { SkipLink } from '../components/SkipLink'
import { ToastProvider } from '../components/Toast'
import { HomePage } from '../pages/HomePage'
import { KeyboardHelp } from '../components/KeyboardHelp'

const GraphPage = lazy(() => import('../pages/GraphPage').then(m => ({ default: m.GraphPage })))
const ArchivePage = lazy(() => import('../pages/ArchivePage').then(m => ({ default: m.ArchivePage })))

export function ModernLayout() {
  return (
    <BrowserRouter basename="/daily-digest">
      <ToastProvider>
        <div className="min-h-screen bg-paper dark:bg-paper-dark text-text-primary dark:text-[#F5F5F7] font-sans antialiased">
          <SkipLink />
          <Navbar />
          <main id="main-content">
            <Suspense fallback={<div className="pt-28 max-w-5xl mx-auto px-4 text-text-muted">Loading...</div>}>
              <Routes>
                <Route path="/" element={<HomePage />} />
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
