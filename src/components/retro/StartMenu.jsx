import { useEffect, useRef } from 'react';
import { useWindows } from '../../contexts/WindowContext';

const MENU_ITEMS = [
  {
    id: 'browser',
    title: 'Daily Digest',
    icon: '\uD83D\uDCF0',
    width: 800,
    height: 600,
  },
  {
    id: 'graph',
    title: 'Knowledge Graph',
    icon: '\uD83D\uDD78\uFE0F',
    width: 900,
    height: 600,
  },
  {
    id: 'archive',
    title: 'Archive',
    icon: '\uD83D\uDCC1',
    width: 700,
    height: 500,
  },
  { separator: true },
  {
    id: 'settings',
    title: 'Settings',
    icon: '\u2699\uFE0F',
    width: 400,
    height: 350,
  },
  {
    id: 'about',
    title: 'About',
    icon: '\u2753',
    width: 400,
    height: 300,
  },
  { separator: true },
  {
    id: 'shutdown',
    title: 'Shut Down...',
    icon: '\uD83D\uDDA5\uFE0F',
  },
];

export default function StartMenu({ visible, onClose, onShutdown }) {
  const { openWindow } = useWindows();
  const menuRef = useRef(null);

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

  function handleItemClick(item) {
    if (item.id === 'shutdown') {
      onClose();
      if (onShutdown) onShutdown();
      return;
    }

    openWindow({
      id: item.id,
      title: item.title,
      width: item.width,
      height: item.height,
    });
    onClose();
  }

  return (
    <div className="os-start-menu" ref={menuRef} style={{ zIndex: 10000 }}>
      <div className="os-start-sidebar">
        <span>Daily Digest 95</span>
      </div>
      <div style={{ flex: 1 }}>
        {MENU_ITEMS.map((item, i) =>
          item.separator ? (
            <hr key={`sep-${i}`} className="os-separator" />
          ) : (
            <div
              key={item.id}
              className="os-start-menu-item"
              onClick={() => handleItemClick(item)}
            >
              <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>
                {item.icon}
              </span>
              {item.title}
            </div>
          )
        )}
      </div>
    </div>
  );
}
