import { useState, useRef, useCallback, useEffect, useMemo, Component } from 'react';
import { useDesktopTheme } from '../../contexts/DesktopThemeContext';
import { useWindows } from '../../contexts/WindowContext';

/* ---------------------------------------------------------------------------
   Error Boundary (class component – React requirement)
   --------------------------------------------------------------------------- */

class WindowErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const { theme } = this.props;
      return (
        <div className="os-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span style={{ fontSize: theme === 'win95' ? 11 : 12, fontWeight: 'bold' }}>
            {theme === 'win95'
              ? 'This program has performed an illegal operation and will be shut down.'
              : 'The application "unknown" has unexpectedly quit.'}
          </span>
          <span style={{ fontSize: theme === 'win95' ? 11 : 10, color: '#666' }}>
            {this.state.error?.message || 'Unknown error'}
          </span>
          <button
            className="os-btn"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            {theme === 'win95' ? 'Close' : 'Relaunch'}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ---------------------------------------------------------------------------
   Constants
   --------------------------------------------------------------------------- */

const MIN_WIDTH = 240;
const MIN_HEIGHT = 160;
const RESIZE_ZONE = 8;

/* ---------------------------------------------------------------------------
   RetroWindow
   --------------------------------------------------------------------------- */

export default function RetroWindow({ id, children, title }) {
  const { desktopTheme } = useDesktopTheme();
  const {
    windows,
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    updatePosition,
    updateSize,
  } = useWindows();

  const win = windows[id];
  const windowRef = useRef(null);
  const dragRef = useRef(null);
  const resizeRef = useRef(null);

  /* ---- Derived state ---------------------------------------------------- */

  const isInactive = useMemo(() => {
    if (!win) return true;
    const maxZ = Math.max(
      ...Object.values(windows)
        .filter((w) => !w.is_minimized)
        .map((w) => w.z_index),
    );
    return win.z_index < maxZ;
  }, [win, windows]);

  /* ---- Don't render if minimized or missing ----------------------------- */

  if (!win || win.is_minimized) return null;

  const { x, y, width, height, z_index, is_maximized } = win;

  /* ---- Position / size styles ------------------------------------------- */

  const windowStyle = is_maximized
    ? { top: 0, left: 0, width: '100%', height: '100%', zIndex: z_index }
    : { top: y, left: x, width, height, zIndex: z_index };

  /* ---- Chrome buttons per theme ----------------------------------------- */

  const isMac = desktopTheme === 'mac';

  return (
    <div
      ref={windowRef}
      className="os-window"
      style={windowStyle}
      role="dialog"
      aria-label={title}
      tabIndex={-1}
      onMouseDown={() => focusWindow(id)}
      onTouchStart={() => focusWindow(id)}
    >
      <Titlebar
        id={id}
        title={title}
        isMac={isMac}
        isMaximized={is_maximized}
        isInactive={isInactive}
        windowRef={windowRef}
        dragRef={dragRef}
        win={win}
        focusWindow={focusWindow}
        closeWindow={closeWindow}
        minimizeWindow={minimizeWindow}
        maximizeWindow={maximizeWindow}
        restoreWindow={restoreWindow}
        updatePosition={updatePosition}
      />

      <WindowErrorBoundary theme={desktopTheme}>
        <div className="os-content">{children}</div>
      </WindowErrorBoundary>

      {/* Resize handles (skip when maximized) */}
      {!is_maximized && (
        <ResizeHandles
          id={id}
          windowRef={windowRef}
          resizeRef={resizeRef}
          win={win}
          updateSize={updateSize}
          updatePosition={updatePosition}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Titlebar (sub-component)
   --------------------------------------------------------------------------- */

function Titlebar({
  id,
  title,
  isMac,
  isMaximized,
  isInactive,
  windowRef,
  dragRef,
  win,
  focusWindow,
  closeWindow,
  minimizeWindow,
  maximizeWindow,
  restoreWindow,
  updatePosition,
}) {
  const handlePointerDown = useCallback(
    (e) => {
      if (isMaximized) return;

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const rect = windowRef.current.getBoundingClientRect();
      const offset_x = clientX - rect.left;
      const offset_y = clientY - rect.top;

      dragRef.current = { offset_x, offset_y };

      const onMove = (ev) => {
        ev.preventDefault();
        const mx = ev.touches ? ev.touches[0].clientX : ev.clientX;
        const my = ev.touches ? ev.touches[0].clientY : ev.clientY;

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const w = windowRef.current.offsetWidth;

        const clamped_x = Math.max(-w + 50, Math.min(mx - offset_x, vw - 50));
        const clamped_y = Math.max(0, Math.min(my - offset_y, vh - 40));

        windowRef.current.style.left = clamped_x + 'px';
        windowRef.current.style.top = clamped_y + 'px';
      };

      const onUp = (ev) => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);

        if (windowRef.current) {
          const finalX = parseInt(windowRef.current.style.left, 10) || 0;
          const finalY = parseInt(windowRef.current.style.top, 10) || 0;
          updatePosition(id, finalX, finalY);
        }
        dragRef.current = null;
      };

      document.addEventListener('mousemove', onMove, { passive: false });
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
    },
    [id, isMaximized, updatePosition, windowRef, dragRef],
  );

  const handleToggleMaximize = useCallback(() => {
    if (isMaximized) {
      restoreWindow(id);
    } else {
      maximizeWindow(id);
    }
  }, [id, isMaximized, maximizeWindow, restoreWindow]);

  if (isMac) {
    /* Mac: [close] [title text] [zoom] */
    return (
      <div
        className={`os-titlebar${isInactive ? ' inactive' : ''}`}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        <button
          className="os-btn-close"
          aria-label="Close"
          onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
        />
        <span className="os-titlebar-text">{title}</span>
        <button
          className="os-btn-zoom"
          aria-label={isMaximized ? 'Restore' : 'Zoom'}
          onClick={(e) => { e.stopPropagation(); handleToggleMaximize(); }}
        />
      </div>
    );
  }

  /* Win95: [title text] [_] [□] [X] */
  return (
    <div
      className={`os-titlebar${isInactive ? ' inactive' : ''}`}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
    >
      <span className="os-titlebar-text">{title}</span>
      <button
        className="os-btn-chrome"
        aria-label="Minimize"
        onClick={(e) => { e.stopPropagation(); minimizeWindow(id); }}
      >
        _
      </button>
      <button
        className="os-btn-chrome"
        aria-label={isMaximized ? 'Restore' : 'Maximize'}
        onClick={(e) => { e.stopPropagation(); handleToggleMaximize(); }}
      >
        {isMaximized ? '\u29C9' : '\u25A1'}
      </button>
      <button
        className="os-btn-chrome"
        aria-label="Close"
        onClick={(e) => { e.stopPropagation(); closeWindow(id); }}
      >
        X
      </button>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Resize Handles (sub-component)
   --------------------------------------------------------------------------- */

function ResizeHandles({ id, windowRef, resizeRef, win, updateSize, updatePosition }) {
  const startResize = useCallback(
    (edge, e) => {
      e.preventDefault();
      e.stopPropagation();

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const startX = clientX;
      const startY = clientY;
      const startW = windowRef.current.offsetWidth;
      const startH = windowRef.current.offsetHeight;
      const startLeft = windowRef.current.offsetLeft;
      const startTop = windowRef.current.offsetTop;

      resizeRef.current = { edge, startX, startY, startW, startH, startLeft, startTop };

      const onMove = (ev) => {
        ev.preventDefault();
        const mx = ev.touches ? ev.touches[0].clientX : ev.clientX;
        const my = ev.touches ? ev.touches[0].clientY : ev.clientY;
        const dx = mx - startX;
        const dy = my - startY;

        let newW = startW;
        let newH = startH;
        let newLeft = startLeft;
        let newTop = startTop;

        if (edge.includes('right')) {
          newW = Math.max(MIN_WIDTH, startW + dx);
        }
        if (edge.includes('bottom')) {
          newH = Math.max(MIN_HEIGHT, startH + dy);
        }
        if (edge.includes('left')) {
          const proposedW = startW - dx;
          if (proposedW >= MIN_WIDTH) {
            newW = proposedW;
            newLeft = startLeft + dx;
          }
        }
        if (edge.includes('top')) {
          const proposedH = startH - dy;
          if (proposedH >= MIN_HEIGHT) {
            newH = proposedH;
            newTop = startTop + dy;
          }
        }

        windowRef.current.style.width = newW + 'px';
        windowRef.current.style.height = newH + 'px';
        windowRef.current.style.left = newLeft + 'px';
        windowRef.current.style.top = newTop + 'px';
      };

      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onUp);

        if (windowRef.current) {
          const finalW = windowRef.current.offsetWidth;
          const finalH = windowRef.current.offsetHeight;
          const finalX = parseInt(windowRef.current.style.left, 10) || 0;
          const finalY = parseInt(windowRef.current.style.top, 10) || 0;
          updateSize(id, finalW, finalH);
          updatePosition(id, finalX, finalY);
        }
        resizeRef.current = null;
      };

      document.addEventListener('mousemove', onMove, { passive: false });
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
    },
    [id, windowRef, resizeRef, updateSize, updatePosition],
  );

  const handleStyle = {
    position: 'absolute',
    background: 'transparent',
    zIndex: 1,
  };

  return (
    <>
      {/* Right edge */}
      <div
        style={{ ...handleStyle, top: 0, right: 0, width: RESIZE_ZONE, height: '100%', cursor: 'ew-resize' }}
        onMouseDown={(e) => startResize('right', e)}
        onTouchStart={(e) => startResize('right', e)}
      />
      {/* Bottom edge */}
      <div
        style={{ ...handleStyle, bottom: 0, left: 0, width: '100%', height: RESIZE_ZONE, cursor: 'ns-resize' }}
        onMouseDown={(e) => startResize('bottom', e)}
        onTouchStart={(e) => startResize('bottom', e)}
      />
      {/* Bottom-right corner */}
      <div
        style={{ ...handleStyle, bottom: 0, right: 0, width: RESIZE_ZONE * 2, height: RESIZE_ZONE * 2, cursor: 'nwse-resize' }}
        onMouseDown={(e) => startResize('bottom-right', e)}
        onTouchStart={(e) => startResize('bottom-right', e)}
      />
    </>
  );
}
