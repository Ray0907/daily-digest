import React, { lazy, Suspense } from 'react'
import { DesktopThemeProvider, useDesktopTheme } from './contexts/DesktopThemeContext'
import { WindowProvider, useWindows } from './contexts/WindowContext'
import { ToastProvider } from './components/Toast'
import RetroDesktop from './components/retro/RetroDesktop'
import RetroWindow from './components/retro/RetroWindow'
import RetroTaskbar from './components/retro/RetroTaskbar'
import MacMenuBar from './components/retro/MacMenuBar'
import BootScreen from './components/retro/BootScreen'
import ShutdownScreen from './components/retro/ShutdownScreen'
import ContextMenu from './components/retro/ContextMenu'
import ScreenSaver from './components/retro/ScreenSaver'
import DialUpDialog from './components/retro/DialUpDialog'
import { useScreenSaver } from './hooks/useScreenSaver'
import { HomePage } from './pages/HomePage'

const GraphPage = lazy(() => import('./pages/GraphPage').then(m => ({ default: m.GraphPage })))
const ArchivePage = lazy(() => import('./pages/ArchivePage').then(m => ({ default: m.ArchivePage })))
const SettingsWindow = lazy(() => import('./components/retro/SettingsWindow'))
const AboutWindow = lazy(() => import('./components/retro/AboutWindow'))
const ModernLayout = lazy(() => import('./layouts/ModernLayout').then(m => ({ default: m.ModernLayout })))

function DesktopShell() {
  const { desktopTheme } = useDesktopTheme()
  const { windows, openWindow } = useWindows()
  const { is_active: screensaver_active } = useScreenSaver(60000)

  const [is_booting, setIsBooting] = React.useState(true)
  const [show_shutdown, setShowShutdown] = React.useState(false)
  const [show_screensaver, setShowScreensaver] = React.useState(false)
  const [context_menu, setContextMenu] = React.useState({ visible: false, x: 0, y: 0 })
  const [show_dialup, setShowDialup] = React.useState(false)
  const [dialup_shown, setDialupShown] = React.useState(false)
  const [initialized, setInitialized] = React.useState(false)

  // Track screensaver from idle hook
  React.useEffect(() => {
    if (screensaver_active && !is_booting && !show_shutdown) {
      setShowScreensaver(true)
    }
  }, [screensaver_active, is_booting, show_shutdown])

  // Auto-open Daily Digest on first load (after boot)
  React.useEffect(() => {
    if (!initialized && !is_booting) {
      if (!dialup_shown) {
        setShowDialup(true)
        setDialupShown(true)
      } else {
        openWindow({ id: 'browser', title: 'Daily Digest', width: 800, height: 600 })
      }
      setInitialized(true)
    }
  }, [initialized, is_booting, openWindow, dialup_shown])

  // Right-click handler for desktop
  React.useEffect(() => {
    if (desktopTheme === 'modern') return
    const handler = (e) => {
      // Only on desktop background
      if (e.target.closest('.os-window') || e.target.closest('.os-taskbar') || e.target.closest('.os-global-menubar')) return
      e.preventDefault()
      setContextMenu({ visible: true, x: e.clientX, y: e.clientY })
    }
    document.addEventListener('contextmenu', handler)
    return () => document.removeEventListener('contextmenu', handler)
  }, [desktopTheme])

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
      <RetroTaskbar onShutdown={() => setShowShutdown(true)} />
      <MacMenuBar onShutdown={() => setShowShutdown(true)} />
      <ContextMenu
        x={context_menu.x}
        y={context_menu.y}
        visible={context_menu.visible}
        onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
      />
      {is_booting && (
        <BootScreen
          theme={desktopTheme}
          onComplete={() => setIsBooting(false)}
        />
      )}
      <ShutdownScreen
        theme={desktopTheme}
        visible={show_shutdown}
        onCancel={() => setShowShutdown(false)}
        onReboot={() => {
          setShowShutdown(false)
          setIsBooting(true)
          setInitialized(false)
          setDialupShown(false)
        }}
      />
      {show_screensaver && !is_booting && !show_shutdown && (
        <ScreenSaver
          theme={desktopTheme}
          onDismiss={() => setShowScreensaver(false)}
        />
      )}
      {show_dialup && (
        <DialUpDialog
          visible={show_dialup}
          onComplete={() => {
            setShowDialup(false)
            openWindow({ id: 'browser', title: 'Daily Digest', width: 800, height: 600 })
          }}
        />
      )}
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
