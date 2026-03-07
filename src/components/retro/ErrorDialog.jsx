import { useCallback } from 'react';

const WIN95_MESSAGES = ['An error has occurred.'];
const MAC_MESSAGES = ['Sorry, a system error occurred.'];

export default function ErrorDialog({ visible, onClose, theme }) {
  const handleClose = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  if (!visible) return null;

  if (theme === 'mac') {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            background: '#fff',
            border: '2px solid #000',
            borderRadius: 8,
            padding: '24px 32px',
            minWidth: 320,
            boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
            textAlign: 'center',
            fontFamily: 'Chicago, Geneva, sans-serif',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>💣</div>
          <p style={{ fontSize: 13, marginBottom: 20, color: '#000' }}>
            {MAC_MESSAGES[0]}
          </p>
          <button className="os-btn" onClick={handleClose}>
            Restart
          </button>
        </div>
      </div>
    );
  }

  // Win95
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: '#c0c0c0',
          border: '2px solid #fff',
          borderRight: '2px solid #808080',
          borderBottom: '2px solid #808080',
          padding: 0,
          minWidth: 340,
          boxShadow: '1px 1px 0 #000',
          fontFamily: '"MS Sans Serif", Tahoma, sans-serif',
        }}
      >
        <div
          style={{
            background: '#000080',
            color: '#fff',
            padding: '2px 4px',
            fontSize: 12,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span>Error</span>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              style={{ flexShrink: 0 }}
            >
              <polygon points="16,2 30,28 2,28" fill="#ffff00" stroke="#000" strokeWidth="1.5" />
              <text
                x="16"
                y="24"
                textAnchor="middle"
                fontSize="18"
                fontWeight="bold"
                fill="#000"
                fontFamily="sans-serif"
              >
                !
              </text>
            </svg>
            <span style={{ fontSize: 12, color: '#000' }}>{WIN95_MESSAGES[0]}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            <button className="os-btn" onClick={handleClose} style={{ minWidth: 75 }}>
              OK
            </button>
            <button className="os-btn" onClick={handleClose} style={{ minWidth: 75 }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
