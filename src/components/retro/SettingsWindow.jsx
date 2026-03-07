import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDesktopTheme } from '../../contexts/DesktopThemeContext';
import { useTheme } from '../../hooks/useTheme';

export default function SettingsWindow() {
  const { desktopTheme, setDesktopTheme } = useDesktopTheme();
  const { is_dark, toggleTheme } = useTheme();
  const { i18n } = useTranslation();

  const [crtEnabled, setCrtEnabled] = useState(() =>
    document.body.classList.contains('crt-effect')
  );

  const [soundEnabled, setSoundEnabled] = useState(() =>
    localStorage.getItem('sound-effects') === 'true'
  );

  useEffect(() => {
    document.body.classList.toggle('crt-effect', crtEnabled);
  }, [crtEnabled]);

  useEffect(() => {
    localStorage.setItem('sound-effects', soundEnabled ? 'true' : 'false');
  }, [soundEnabled]);

  const hideDarkMode = desktopTheme === 'win95' || desktopTheme === 'mac';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Theme */}
      <fieldset className="os-sunken" style={{ margin: 0, padding: 8 }}>
        <legend>Theme</legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label>
            <input
              type="radio"
              name="desktop-theme"
              checked={desktopTheme === 'win95'}
              onChange={() => setDesktopTheme('win95')}
            />{' '}
            Windows 95
          </label>
          <label>
            <input
              type="radio"
              name="desktop-theme"
              checked={desktopTheme === 'mac'}
              onChange={() => setDesktopTheme('mac')}
            />{' '}
            Classic Macintosh
          </label>
          <label>
            <input
              type="radio"
              name="desktop-theme"
              checked={desktopTheme === 'modern'}
              onChange={() => setDesktopTheme('modern')}
            />{' '}
            Modern
          </label>
        </div>
      </fieldset>

      {/* Display */}
      <fieldset className="os-sunken" style={{ margin: 0, padding: 8 }}>
        <legend>Display</legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {!hideDarkMode && (
            <label>
              <input
                type="checkbox"
                checked={is_dark}
                onChange={toggleTheme}
              />{' '}
              Dark mode
            </label>
          )}
          <label>
            <input
              type="checkbox"
              checked={crtEnabled}
              onChange={() => setCrtEnabled((v) => !v)}
            />{' '}
            CRT scanlines
          </label>
        </div>
      </fieldset>

      {/* Language */}
      <fieldset className="os-sunken" style={{ margin: 0, padding: 8 }}>
        <legend>Language</legend>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className={`os-btn${i18n.language === 'en' ? ' os-raised' : ''}`}
            onClick={() => i18n.changeLanguage('en')}
          >
            English
          </button>
          <button
            className={`os-btn${i18n.language === 'zh' ? ' os-raised' : ''}`}
            onClick={() => i18n.changeLanguage('zh')}
          >
            繁體中文
          </button>
        </div>
      </fieldset>

      {/* Sound */}
      <fieldset className="os-sunken" style={{ margin: 0, padding: 8 }}>
        <legend>Sound</legend>
        <label>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={() => setSoundEnabled((v) => !v)}
          />{' '}
          Enable sound effects
        </label>
      </fieldset>
    </div>
  );
}
