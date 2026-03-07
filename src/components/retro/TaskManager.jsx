import { useState, useMemo } from 'react';
import { useWindows } from '../../contexts/WindowContext';

function fakeMemory() {
  return (Math.floor(Math.random() * 9000) + 500).toLocaleString() + ' KB';
}

export default function TaskManager() {
  const { windows, closeWindow } = useWindows();
  const [selectedId, setSelectedId] = useState(null);

  const windowList = Object.values(windows);

  // Pick one random window to show as "Not Responding"
  const notRespondingId = useMemo(() => {
    if (windowList.length === 0) return null;
    return windowList[Math.floor(Math.random() * windowList.length)].id;
  }, [windowList.length]);

  // Stable fake memory values per window
  const memoryMap = useMemo(() => {
    const map = {};
    windowList.forEach((w) => {
      map[w.id] = fakeMemory();
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowList.map((w) => w.id).join(',')]);

  const handleEndTask = () => {
    if (selectedId && windows[selectedId]) {
      closeWindow(selectedId);
      setSelectedId(null);
    }
  };

  return (
    <div
      style={{
        padding: 8,
        fontFamily: '"MS Sans Serif", Tahoma, sans-serif',
        fontSize: 12,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          border: '1px solid #808080',
          background: '#fff',
          marginBottom: 8,
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#c0c0c0', textAlign: 'left' }}>
              <th style={{ padding: '4px 8px', borderBottom: '1px solid #808080' }}>
                Application
              </th>
              <th style={{ padding: '4px 8px', borderBottom: '1px solid #808080' }}>
                Status
              </th>
              <th style={{ padding: '4px 8px', borderBottom: '1px solid #808080' }}>
                Memory
              </th>
            </tr>
          </thead>
          <tbody>
            {windowList.map((win) => {
              const isSelected = selectedId === win.id;
              const isNotResponding = win.id === notRespondingId;
              return (
                <tr
                  key={win.id}
                  onClick={() => setSelectedId(win.id)}
                  style={{
                    background: isSelected ? '#000080' : 'transparent',
                    color: isSelected ? '#fff' : '#000',
                    cursor: 'pointer',
                  }}
                >
                  <td style={{ padding: '2px 8px' }}>{win.title || win.id}</td>
                  <td style={{ padding: '2px 8px' }}>
                    {isNotResponding ? 'Not Responding' : 'Running'}
                  </td>
                  <td style={{ padding: '2px 8px' }}>{memoryMap[win.id] || '0 KB'}</td>
                </tr>
              );
            })}
            {windowList.length === 0 && (
              <tr>
                <td colSpan={3} style={{ padding: '8px', textAlign: 'center', color: '#808080' }}>
                  No applications running.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          className="os-btn"
          onClick={handleEndTask}
          disabled={!selectedId}
          style={{ minWidth: 90 }}
        >
          End Task
        </button>
      </div>
    </div>
  );
}
