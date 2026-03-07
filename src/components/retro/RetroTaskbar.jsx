import { useState, useEffect } from 'react';
import { useDesktopTheme } from '../../contexts/DesktopThemeContext';
import { useWindows } from '../../contexts/WindowContext';
import StartMenu from './StartMenu';

function formatTime(date) {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export default function RetroTaskbar() {
  const { desktopTheme } = useDesktopTheme();
  const { windows, focused_id, minimizeWindow, restoreWindow, focusWindow } = useWindows();
  const [showStart, setShowStart] = useState(false);
  const [time, setTime] = useState(() => formatTime(new Date()));

  useEffect(() => {
    const id = setInterval(() => {
      setTime(formatTime(new Date()));
    }, 60000);
    return () => clearInterval(id);
  }, []);

  if (desktopTheme !== 'win95') return null;

  const windowList = Object.values(windows);

  const handleTaskbarBtnClick = (win) => {
    if (win.is_minimized) {
      restoreWindow(win.id);
    } else if (focused_id === win.id) {
      minimizeWindow(win.id);
    } else {
      focusWindow(win.id);
    }
  };

  return (
    <div className="os-taskbar" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
      <button
        className="os-start-btn"
        onClick={() => setShowStart((s) => !s)}
      >
        <span aria-hidden="true">&#x229E;</span> Start
      </button>

      <div className="os-taskbar-separator" />

      {windowList.map((win) => (
        <button
          key={win.id}
          className={`os-taskbar-btn${focused_id === win.id ? ' active' : ''}`}
          onClick={() => handleTaskbarBtnClick(win)}
        >
          {win.title}
        </button>
      ))}

      <div className="os-clock">{time}</div>
      <StartMenu visible={showStart} onClose={() => setShowStart(false)} />
    </div>
  );
}
