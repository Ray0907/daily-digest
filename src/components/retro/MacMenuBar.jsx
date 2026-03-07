import { useState, useEffect, useRef } from 'react';
import { useDesktopTheme } from '../../contexts/DesktopThemeContext';
import { useWindows } from '../../contexts/WindowContext';

function formatTime(date) {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export default function MacMenuBar({ onShutdown }) {
  const { desktopTheme } = useDesktopTheme();
  const { windows, openWindow, focusWindow } = useWindows();
  const [openMenu, setOpenMenu] = useState(null);
  const [time, setTime] = useState(() => formatTime(new Date()));
  const menuBarRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => {
      setTime(formatTime(new Date()));
    }, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (openMenu === null) return;
    function handleClickOutside(e) {
      if (menuBarRef.current && !menuBarRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenu]);

  if (desktopTheme !== 'mac') return null;

  const windowList = Object.values(windows);

  const handleMenuClick = (name) => {
    setOpenMenu((prev) => (prev === name ? null : name));
  };

  const closeMenu = () => setOpenMenu(null);

  const handleAbout = () => {
    openWindow({ id: 'about', title: 'About This Macintosh', width: 400, height: 300 });
    closeMenu();
  };

  const handleFocusWindow = (id) => {
    focusWindow(id);
    closeMenu();
  };

  return (
    <div
      className="os-global-menubar"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}
      ref={menuBarRef}
    >
      {/* Apple menu */}
      <div className="os-menubar-item" onClick={() => handleMenuClick('apple')}>
        &#x25C6;
        {openMenu === 'apple' && (
          <div className="os-menu-dropdown">
            <div className="os-menu-dropdown-item" onClick={handleAbout}>
              About This Macintosh
            </div>
            {windowList.length > 0 && <div className="os-menu-dropdown-separator" />}
            {windowList.map((win) => (
              <div
                key={win.id}
                className="os-menu-dropdown-item"
                onClick={() => handleFocusWindow(win.id)}
              >
                {win.title}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* File menu */}
      <div className="os-menubar-item" onClick={() => handleMenuClick('file')}>
        File
        {openMenu === 'file' && (
          <div className="os-menu-dropdown">
            <div className="os-menu-dropdown-item disabled">New</div>
            <div className="os-menu-dropdown-item disabled">Open...</div>
            <div className="os-menu-dropdown-item disabled">Close</div>
          </div>
        )}
      </div>

      {/* Edit menu */}
      <div className="os-menubar-item" onClick={() => handleMenuClick('edit')}>
        Edit
        {openMenu === 'edit' && (
          <div className="os-menu-dropdown">
            <div className="os-menu-dropdown-item disabled">Undo</div>
            <div className="os-menu-dropdown-item disabled">Cut</div>
            <div className="os-menu-dropdown-item disabled">Copy</div>
            <div className="os-menu-dropdown-item disabled">Paste</div>
          </div>
        )}
      </div>

      {/* View menu */}
      <div className="os-menubar-item" onClick={() => handleMenuClick('view')}>
        View
        {openMenu === 'view' && (
          <div className="os-menu-dropdown">
            <div className="os-menu-dropdown-item disabled">by Icon</div>
            <div className="os-menu-dropdown-item disabled">by Name</div>
          </div>
        )}
      </div>

      {/* Special menu */}
      <div className="os-menubar-item" onClick={() => handleMenuClick('special')}>
        Special
        {openMenu === 'special' && (
          <div className="os-menu-dropdown">
            <div className="os-menu-dropdown-item" onClick={() => { closeMenu(); if (onShutdown) onShutdown(); }}>Shut Down...</div>
          </div>
        )}
      </div>

      {/* Clock on the right */}
      <div className="os-menubar-clock">{time}</div>
    </div>
  );
}
