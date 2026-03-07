import { createContext, useContext, useReducer, useCallback } from 'react';

const WindowContext = createContext();

const STAGGER_OFFSET = 30;
const Z_INDEX_START = 100;
const Z_INDEX_MAX = 999;

function normalizeZIndexes(windows) {
  const sorted = Object.values(windows)
    .sort((a, b) => a.z_index - b.z_index);
  const updated = { ...windows };
  sorted.forEach((win, i) => {
    updated[win.id] = { ...updated[win.id], z_index: Z_INDEX_START + i };
  });
  return updated;
}

function nextZIndex(windows, currentCounter) {
  if (currentCounter >= Z_INDEX_MAX) {
    return { windows: normalizeZIndexes(windows), counter: Z_INDEX_START + Object.keys(windows).length };
  }
  return { windows, counter: currentCounter };
}

const initialState = {
  windows: {},
  focused_id: null,
  focus_stack: [],
  z_counter: Z_INDEX_START,
};

function reducer(state, action) {
  switch (action.type) {
    case 'OPEN_WINDOW': {
      const { id, title, icon, width = 600, height = 400 } = action.payload;
      if (state.windows[id]) {
        // Already open — just focus it
        return reducer(state, { type: 'FOCUS_WINDOW', payload: { id } });
      }

      const windowCount = Object.keys(state.windows).length;
      const isMobile = window.innerWidth < 768;

      const centerX = Math.max(0, Math.round((window.innerWidth - width) / 2) + windowCount * STAGGER_OFFSET);
      const centerY = Math.max(0, Math.round((window.innerHeight - height) / 2) + windowCount * STAGGER_OFFSET);

      const { windows: normalized, counter } = nextZIndex(state.windows, state.z_counter);
      const z_index = counter;

      const newWindow = {
        id,
        title,
        icon,
        x: centerX,
        y: centerY,
        width,
        height,
        is_minimized: false,
        is_maximized: isMobile,
        z_index,
      };

      return {
        ...state,
        windows: { ...normalized, [id]: newWindow },
        focused_id: id,
        focus_stack: [...state.focus_stack.filter((fid) => fid !== id), id],
        z_counter: counter + 1,
      };
    }

    case 'CLOSE_WINDOW': {
      const { id } = action.payload;
      const { [id]: _, ...rest } = state.windows;
      const newStack = state.focus_stack.filter((fid) => fid !== id);
      const newFocused = state.focused_id === id
        ? (newStack.length > 0 ? newStack[newStack.length - 1] : null)
        : state.focused_id;

      return {
        ...state,
        windows: rest,
        focused_id: newFocused,
        focus_stack: newStack,
      };
    }

    case 'MINIMIZE_WINDOW': {
      const { id } = action.payload;
      if (!state.windows[id]) return state;

      const newStack = state.focus_stack.filter((fid) => fid !== id);
      const newFocused = state.focused_id === id
        ? (newStack.length > 0 ? newStack[newStack.length - 1] : null)
        : state.focused_id;

      return {
        ...state,
        windows: {
          ...state.windows,
          [id]: { ...state.windows[id], is_minimized: true },
        },
        focused_id: newFocused,
        focus_stack: newStack,
      };
    }

    case 'MAXIMIZE_WINDOW': {
      const { id } = action.payload;
      if (!state.windows[id]) return state;
      return {
        ...state,
        windows: {
          ...state.windows,
          [id]: { ...state.windows[id], is_maximized: true },
        },
      };
    }

    case 'RESTORE_WINDOW': {
      const { id } = action.payload;
      if (!state.windows[id]) return state;

      const { windows: normalized, counter } = nextZIndex(state.windows, state.z_counter);

      return {
        ...state,
        windows: {
          ...normalized,
          [id]: { ...normalized[id], is_minimized: false, is_maximized: false, z_index: counter },
        },
        focused_id: id,
        focus_stack: [...state.focus_stack.filter((fid) => fid !== id), id],
        z_counter: counter + 1,
      };
    }

    case 'FOCUS_WINDOW': {
      const { id } = action.payload;
      if (!state.windows[id]) return state;

      const { windows: normalized, counter } = nextZIndex(state.windows, state.z_counter);

      return {
        ...state,
        windows: {
          ...normalized,
          [id]: {
            ...normalized[id],
            is_minimized: false,
            z_index: counter,
          },
        },
        focused_id: id,
        focus_stack: [...state.focus_stack.filter((fid) => fid !== id), id],
        z_counter: counter + 1,
      };
    }

    case 'UPDATE_POSITION': {
      const { id, x, y } = action.payload;
      if (!state.windows[id]) return state;
      return {
        ...state,
        windows: {
          ...state.windows,
          [id]: { ...state.windows[id], x, y },
        },
      };
    }

    case 'UPDATE_SIZE': {
      const { id, width, height } = action.payload;
      if (!state.windows[id]) return state;
      return {
        ...state,
        windows: {
          ...state.windows,
          [id]: { ...state.windows[id], width, height },
        },
      };
    }

    default:
      return state;
  }
}

export function WindowProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const openWindow = useCallback((config) => {
    dispatch({ type: 'OPEN_WINDOW', payload: config });
  }, []);

  const closeWindow = useCallback((id) => {
    dispatch({ type: 'CLOSE_WINDOW', payload: { id } });
  }, []);

  const minimizeWindow = useCallback((id) => {
    dispatch({ type: 'MINIMIZE_WINDOW', payload: { id } });
  }, []);

  const maximizeWindow = useCallback((id) => {
    dispatch({ type: 'MAXIMIZE_WINDOW', payload: { id } });
  }, []);

  const restoreWindow = useCallback((id) => {
    dispatch({ type: 'RESTORE_WINDOW', payload: { id } });
  }, []);

  const focusWindow = useCallback((id) => {
    dispatch({ type: 'FOCUS_WINDOW', payload: { id } });
  }, []);

  const updatePosition = useCallback((id, x, y) => {
    dispatch({ type: 'UPDATE_POSITION', payload: { id, x, y } });
  }, []);

  const updateSize = useCallback((id, width, height) => {
    dispatch({ type: 'UPDATE_SIZE', payload: { id, width, height } });
  }, []);

  return (
    <WindowContext.Provider
      value={{
        windows: state.windows,
        focused_id: state.focused_id,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        restoreWindow,
        focusWindow,
        updatePosition,
        updateSize,
      }}
    >
      {children}
    </WindowContext.Provider>
  );
}

export function useWindows() {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('useWindows must be used within a WindowProvider');
  }
  return context;
}
