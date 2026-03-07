import React, { useState } from 'react';
import { useDesktopTheme } from '../../contexts/DesktopThemeContext';
import { useWindows } from '../../contexts/WindowContext';
import {
  BrowserIcon,
  GraphIcon,
  ArchiveIcon,
  SettingsIcon,
  ComputerIcon,
  TrashIcon,
} from './DesktopIcons';

const ICONS = [
  {
    id: 'browser',
    label: 'Daily Digest',
    Icon: BrowserIcon,
    window: { id: 'browser', title: 'Daily Digest', width: 800, height: 600 },
  },
  {
    id: 'graph',
    label: 'Knowledge Graph',
    Icon: GraphIcon,
    window: { id: 'graph', title: 'Knowledge Graph', width: 900, height: 600 },
  },
  {
    id: 'archive',
    label: 'Archive',
    Icon: ArchiveIcon,
    window: { id: 'archive', title: 'Archive', width: 700, height: 500 },
  },
  {
    id: 'settings',
    label: 'Settings',
    Icon: SettingsIcon,
    window: { id: 'settings', title: 'Settings', width: 400, height: 350 },
  },
  {
    id: 'mycomputer',
    label: null, // resolved at render time based on theme
    Icon: ComputerIcon,
    window: { id: 'mycomputer', width: 400, height: 350 },
  },
];

export default function RetroDesktop() {
  const { desktopTheme } = useDesktopTheme();
  const { openWindow } = useWindows();
  const [selectedIcon, setSelectedIcon] = useState(null);

  const variant = desktopTheme === 'mac' ? 'mac' : 'win95';

  function handleDesktopClick(e) {
    if (e.target === e.currentTarget) {
      setSelectedIcon(null);
    }
  }

  function handleIconClick(e, iconId) {
    e.stopPropagation();
    setSelectedIcon(iconId);
  }

  function handleIconDoubleClick(e, icon) {
    e.stopPropagation();
    const title =
      icon.id === 'mycomputer'
        ? desktopTheme === 'mac'
          ? 'Macintosh HD'
          : 'My Computer'
        : icon.window.title;
    openWindow({ ...icon.window, title });
  }

  return (
    <div
      className="desktop-bg"
      style={{ position: 'absolute', inset: 0 }}
      onClick={handleDesktopClick}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          padding: 16,
          alignItems: 'flex-start',
        }}
      >
        {ICONS.map((icon) => {
          const label =
            icon.id === 'mycomputer'
              ? desktopTheme === 'mac'
                ? 'Macintosh HD'
                : 'My Computer'
              : icon.label;

          return (
            <div
              key={icon.id}
              className={`os-desktop-icon${selectedIcon === icon.id ? ' selected' : ''}`}
              onClick={(e) => handleIconClick(e, icon.id)}
              onDoubleClick={(e) => handleIconDoubleClick(e, icon)}
            >
              <icon.Icon size={32} variant={variant} />
              <span>{label}</span>
            </div>
          );
        })}
      </div>

      {desktopTheme === 'mac' && (
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
          }}
        >
          <div
            className={`os-desktop-icon${selectedIcon === 'trash' ? ' selected' : ''}`}
            onClick={(e) => handleIconClick(e, 'trash')}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            <TrashIcon size={32} variant="mac" />
            <span>Trash</span>
          </div>
        </div>
      )}
    </div>
  );
}
