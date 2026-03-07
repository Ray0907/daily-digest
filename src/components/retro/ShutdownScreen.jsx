import { useState, useEffect } from 'react';

const SHUTDOWN_DELAY_MS = 1000;
const MAC_SHRINK_MS = 600;

export default function ShutdownScreen({ theme = 'win95', visible, onCancel, onReboot }) {
  // 'dialog' | 'shutting-down' | 'safe-to-off' | 'mac-shrink' | 'mac-black'
  const [phase, setPhase] = useState('dialog');

  // Reset phase when visibility changes
  useEffect(() => {
    if (visible) {
      setPhase('dialog');
    }
  }, [visible]);

  if (!visible && phase === 'dialog') return null;

  const isWin95 = theme === 'win95';

  const handleOk = () => {
    if (isWin95) {
      setPhase('shutting-down');
    } else {
      setPhase('mac-shrink');
    }
  };

  return (
    <>
      {/* Phase 1: Confirmation dialog */}
      {phase === 'dialog' && (
        <ShutdownDialog
          isWin95={isWin95}
          onOk={handleOk}
          onCancel={onCancel}
        />
      )}

      {/* Phase 2: Shutdown sequence */}
      {isWin95 ? (
        <Win95Shutdown phase={phase} setPhase={setPhase} onReboot={onReboot} />
      ) : (
        <MacShutdown phase={phase} setPhase={setPhase} onReboot={onReboot} />
      )}
    </>
  );
}

function ShutdownDialog({ isWin95, onOk, onCancel }) {
  const dialogStyle = isWin95
    ? {
        backgroundColor: '#C0C0C0',
        border: '2px outset #fff',
        boxShadow: '2px 2px 0 #000',
        padding: 0,
        minWidth: 320,
      }
    : {
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: 8,
        padding: 0,
        minWidth: 300,
        boxShadow: '2px 2px 8px rgba(0,0,0,0.4)',
      };

  const titleBarStyle = isWin95
    ? {
        background: 'linear-gradient(to right, #000080, #1084D0)',
        color: '#fff',
        padding: '3px 6px',
        fontSize: 13,
        fontFamily: '"MS Sans Serif", Arial, sans-serif',
        fontWeight: 'bold',
      }
    : {
        borderBottom: '1px solid #000',
        padding: '8px 12px',
        fontSize: 14,
        fontFamily: 'Chicago, Geneva, sans-serif',
        fontWeight: 'bold',
        textAlign: 'center',
      };

  const buttonBase = isWin95
    ? {
        padding: '4px 24px',
        fontFamily: '"MS Sans Serif", Arial, sans-serif',
        fontSize: 13,
        backgroundColor: '#C0C0C0',
        border: '2px outset #fff',
        cursor: 'pointer',
      }
    : {
        padding: '6px 24px',
        fontFamily: 'Chicago, Geneva, sans-serif',
        fontSize: 13,
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: 6,
        cursor: 'pointer',
      };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
      }}
    >
      <div style={dialogStyle}>
        <div style={titleBarStyle}>
          {isWin95 ? 'Shut Down Windows' : 'Shut Down'}
        </div>
        <div style={{ padding: '20px 24px 16px' }}>
          <p
            style={{
              margin: '0 0 20px',
              fontSize: 13,
              fontFamily: isWin95 ? '"MS Sans Serif", Arial, sans-serif' : 'Chicago, Geneva, sans-serif',
            }}
          >
            Are you sure you want to shut down?
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button style={buttonBase} onClick={onOk}>OK</button>
            <button style={buttonBase} onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Win95Shutdown({ phase, setPhase, onReboot }) {
  useEffect(() => {
    if (phase !== 'shutting-down') return;
    const timer = setTimeout(() => setPhase('safe-to-off'), SHUTDOWN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [phase, setPhase]);

  if (phase !== 'shutting-down' && phase !== 'safe-to-off') return null;

  const isSafe = phase === 'safe-to-off';

  return (
    <div
      onClick={isSafe ? onReboot : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 4000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isSafe ? '#E87400' : '#000',
        cursor: isSafe ? 'pointer' : 'default',
        transition: 'background-color 0.3s ease',
      }}
    >
      <div
        style={{
          color: '#fff',
          fontSize: 20,
          fontFamily: '"MS Sans Serif", Arial, sans-serif',
          textAlign: 'center',
          lineHeight: 1.6,
        }}
      >
        {isSafe
          ? "It's now safe to turn off\nyour computer."
          : 'Windows is shutting down...'}
      </div>
    </div>
  );
}

function MacShutdown({ phase, setPhase, onReboot }) {
  useEffect(() => {
    if (phase !== 'mac-shrink') return;
    const timer = setTimeout(() => setPhase('mac-black'), MAC_SHRINK_MS);
    return () => clearTimeout(timer);
  }, [phase, setPhase]);

  if (phase !== 'mac-shrink' && phase !== 'mac-black') return null;

  if (phase === 'mac-shrink') {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 4000,
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#fff',
            animation: `macDotShrink ${MAC_SHRINK_MS}ms ease-in-out forwards`,
          }}
        />
        <style>{`
          @keyframes macDotShrink {
            0% {
              width: 100vmax;
              height: 100vmax;
              borderRadius: 0;
            }
            70% {
              width: 12px;
              height: 12px;
              borderRadius: 50%;
            }
            100% {
              width: 6px;
              height: 6px;
              borderRadius: 50%;
            }
          }
        `}</style>
      </div>
    );
  }

  // mac-black: click anywhere to reboot
  return (
    <div
      onClick={onReboot}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 4000,
        backgroundColor: '#000',
        cursor: 'pointer',
      }}
    />
  );
}
