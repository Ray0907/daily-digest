import { useEffect, useRef, useState } from 'react';
import { useDesktopTheme } from '../../contexts/DesktopThemeContext';
import { useWindows } from '../../contexts/WindowContext';

const WALLPAPER_COLORS = ['#008080', '#000080', '#2c2c2c', '#3a6ea5', '#5c4033', '#2d4a22'];

export default function ContextMenu({ x, y, visible, onClose }) {
  const { desktopTheme } = useDesktopTheme();
  const { openWindow } = useWindows();
  const menuRef = useRef(null);
  const [crtEnabled, setCrtEnabled] = useState(() =>
    document.body.classList.contains('crt-effect')
  );

  useEffect(() => {
    if (!visible) return;

    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [visible, onClose]);

  if (!visible) return null;

  // Clamp position to viewport edges
  const menuWidth = 200;
  const menuHeight = 200;
  const clampedX = Math.min(x, window.innerWidth - menuWidth);
  const clampedY = Math.min(y, window.innerHeight - menuHeight);

  function handleArrangeIcons() {
    onClose();
  }

  function handleChangeWallpaper() {
    const currentBg = document.body.style.backgroundColor || '';
    const currentIndex = WALLPAPER_COLORS.indexOf(currentBg);
    const nextIndex = (currentIndex + 1) % WALLPAPER_COLORS.length;
    document.body.style.backgroundColor = WALLPAPER_COLORS[nextIndex];
    window.dispatchEvent(
      new CustomEvent('wallpaper-change', { detail: { color: WALLPAPER_COLORS[nextIndex] } })
    );
    onClose();
  }

  function handleToggleCrt() {
    const next = !crtEnabled;
    setCrtEnabled(next);
    document.body.classList.toggle('crt-effect', next);
    onClose();
  }

  function handleSettings() {
    openWindow({ id: 'settings', title: 'Settings', width: 400, height: 350 });
    onClose();
  }

  function handleAbout() {
    openWindow({ id: 'about', title: 'About', width: 400, height: 300 });
    onClose();
  }

  return (
    <div
      ref={menuRef}
      className="os-menu-dropdown"
      style={{
        position: 'fixed',
        left: clampedX,
        top: clampedY,
        zIndex: 2000,
        minWidth: 180,
      }}
    >
      <div className="os-menu-dropdown-item" onClick={handleArrangeIcons}>
        Arrange Icons
      </div>

      <hr className="os-separator" style={{ margin: '2px 0' }} />

      <div className="os-menu-dropdown-item" onClick={handleChangeWallpaper}>
        Change Wallpaper
      </div>
      <div className="os-menu-dropdown-item" onClick={handleToggleCrt}>
        {crtEnabled ? '\u2713 ' : '  '}CRT Scanlines
      </div>

      <hr className="os-separator" style={{ margin: '2px 0' }} />

      <div className="os-menu-dropdown-item" onClick={handleSettings}>
        Settings
      </div>
      <div className="os-menu-dropdown-item" onClick={handleAbout}>
        About
      </div>
    </div>
  );
}
