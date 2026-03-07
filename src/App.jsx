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
import ErrorDialog from './components/retro/ErrorDialog'
import Clippy from './components/retro/Clippy'
import { useScreenSaver } from './hooks/useScreenSaver'
import { useKonamiCode } from './hooks/useKonamiCode'
import { HomePage } from './pages/HomePage'

const GraphPage = lazy(() => import('./pages/GraphPage').then(m => ({ default: m.GraphPage })))
const ArchivePage = lazy(() => import('./pages/ArchivePage').then(m => ({ default: m.ArchivePage })))
const SettingsWindow = lazy(() => import('./components/retro/SettingsWindow'))
const AboutWindow = lazy(() => import('./components/retro/AboutWindow'))
const TaskManager = lazy(() => import('./components/retro/TaskManager'))
const MyComputer = lazy(() => import('./components/retro/MyComputer'))
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
  const [show_error, setShowError] = React.useState(false)
  const [show_clippy, setShowClippy] = React.useState(false)
  const [clippy_dismissed_at, setClippyDismissedAt] = React.useState(0)
  const [show_bsod, setShowBsod] = React.useState(false)

  // Konami code → BSOD easter egg
  useKonamiCode(() => setShowBsod(true))

  // Track screensaver from idle hook
  React.useEffect(() => {
    if (screensaver_active && !is_booting && !show_shutdown) {
      setShowScreensaver(true)
    }
  }, [screensaver_active, is_booting, show_shutdown])

  // Clippy: show after 30s idle (only Win95, not if recently dismissed)
  React.useEffect(() => {
    if (desktopTheme !== 'win95' || is_booting || show_shutdown) return
    const timer = setTimeout(() => {
      if (Date.now() - clippy_dismissed_at > 300000) {
        setShowClippy(true)
      }
    }, 30000)
    return () => clearTimeout(timer)
  }, [desktopTheme, is_booting, show_shutdown, clippy_dismissed_at])

  // BSOD/Sad Mac: 10+ windows
  React.useEffect(() => {
    if (Object.keys(windows).length >= 10) {
      setShowBsod(true)
    }
  }, [windows])

  // Ctrl+Shift+Esc → Task Manager
  React.useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'Escape') {
        e.preventDefault()
        openWindow({ id: 'taskmanager', title: 'Task Manager', width: 450, height: 350 })
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [openWindow])

  // 5% chance error on window open
  const originalOpenWindow = React.useRef(openWindow)
  originalOpenWindow.current = openWindow
  const openWindowWithError = React.useCallback((config) => {
    originalOpenWindow.current(config)
    if (Math.random() < 0.05) {
      setTimeout(() => setShowError(true), 500)
    }
  }, [])

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
    taskmanager: <Suspense fallback={<div className="p-4 text-text-muted">Loading...</div>}><TaskManager /></Suspense>,
    mycomputer: <Suspense fallback={<div className="p-4 text-text-muted">Loading...</div>}><MyComputer /></Suspense>,
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
      {show_error && (
        <ErrorDialog
          visible={show_error}
          onClose={() => setShowError(false)}
          theme={desktopTheme}
        />
      )}
      {show_clippy && (
        <Clippy
          visible={show_clippy}
          onDismiss={() => {
            setShowClippy(false)
            setClippyDismissedAt(Date.now())
          }}
        />
      )}
      {show_bsod && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 4000, cursor: 'pointer',
            background: desktopTheme === 'win95' ? '#0000AA' : '#000',
            color: desktopTheme === 'win95' ? '#fff' : '#fff',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'monospace', fontSize: '14px', padding: '40px', textAlign: 'center',
          }}
          onClick={() => {
            setShowBsod(false)
            setIsBooting(true)
            setInitialized(false)
            setDialupShown(false)
          }}
        >
          {desktopTheme === 'win95' ? (
            <>
              <p style={{ fontSize: '18px', marginBottom: '24px' }}>A fatal exception 0E has occurred at 0028:C0011E36</p>
              <p style={{ marginBottom: '16px' }}>The current application will be terminated.</p>
              <p style={{ marginBottom: '16px' }}>* Press any key to terminate the current application.</p>
              <p style={{ marginBottom: '16px' }}>* Press CTRL+ALT+DEL again to restart your computer.</p>
              <p>You will lose any unsaved information in all applications.</p>
              <p style={{ marginTop: '24px' }}>Press any key to continue _</p>
            </>
          ) : (
            <>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>☹</div>
              <p style={{ fontSize: '14px' }}>Sorry, a system error occurred.</p>
              <p style={{ fontSize: '12px', marginTop: '8px', color: '#888' }}>error type 11</p>
              <p style={{ fontSize: '12px', marginTop: '16px' }}>Click to restart</p>
            </>
          )}
        </div>
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
