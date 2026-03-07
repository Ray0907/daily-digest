import React, { lazy, Suspense } from 'react'
import { DesktopThemeProvider, useDesktopTheme } from './contexts/DesktopThemeContext'
import { WindowProvider, useWindows } from './contexts/WindowContext'
import { ToastProvider } from './components/Toast'
import RetroDesktop from './components/retro/RetroDesktop'
import RetroWindow from './components/retro/RetroWindow'
import RetroTaskbar from './components/retro/RetroTaskbar'
import MacMenuBar from './components/retro/MacMenuBar'
import { HomePage } from './pages/HomePage'

const GraphPage = lazy(() => import('./pages/GraphPage').then(m => ({ default: m.GraphPage })))
const ArchivePage = lazy(() => import('./pages/ArchivePage').then(m => ({ default: m.ArchivePage })))
const SettingsWindow = lazy(() => import('./components/retro/SettingsWindow'))
const AboutWindow = lazy(() => import('./components/retro/AboutWindow'))
const ModernLayout = lazy(() => import('./layouts/ModernLayout').then(m => ({ default: m.ModernLayout })))

function DesktopShell() {
  const { desktopTheme } = useDesktopTheme()
  const { windows, openWindow } = useWindows()

  // Auto-open Daily Digest on first load
  const [initialized, setInitialized] = React.useState(false)
  React.useEffect(() => {
    if (!initialized) {
      openWindow({ id: 'browser', title: 'Daily Digest', width: 800, height: 600 })
      setInitialized(true)
    }
  }, [initialized, openWindow])

  if (desktopTheme === 'modern') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-paper dark:bg-paper-dark flex items-center justify-center text-text-muted">Loading...</div>}>
        <ModernLayout />
      </Suspense>
    )
  }

  const windowContentMap = {
    browser: <HomePage />,
    graph: <Suspense fallback={<div className="p-4 text-text-muted">Loading...</div>}><GraphPage /></Suspense>,
    archive: <Suspense fallback={<div className="p-4 text-text-muted">Loading...</div>}><ArchivePage /></Suspense>,
    settings: <Suspense fallback={<div className="p-4 text-text-muted">Loading...</div>}><SettingsWindow /></Suspense>,
    about: <Suspense fallback={<div className="p-4 text-text-muted">Loading...</div>}><AboutWindow /></Suspense>,
  }

  return (
    <div className="os-shell relative w-full h-screen overflow-hidden">
      <RetroDesktop />
      {Object.values(windows).map(win => (
        <RetroWindow key={win.id} id={win.id} title={win.title}>
          {windowContentMap[win.id] || <div className="p-4">Unknown window</div>}
        </RetroWindow>
      ))}
      <RetroTaskbar />
      <MacMenuBar />
    </div>
  )
}

export default function App() {
  return (
    <DesktopThemeProvider>
      <WindowProvider>
        <ToastProvider>
          <DesktopShell />
        </ToastProvider>
      </WindowProvider>
    </DesktopThemeProvider>
  )
}
