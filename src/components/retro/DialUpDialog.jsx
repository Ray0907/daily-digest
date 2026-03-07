import { useState, useEffect, useRef } from 'react';
import { useDesktopTheme } from '../../contexts/DesktopThemeContext';

const STATUS_STEPS = [
  'Dialing...',
  'Verifying username...',
  'Authenticating...',
  'Connected at 28,800 bps',
];

const STEP_INTERVAL = 800;

export default function DialUpDialog({ visible, onComplete }) {
  const { desktopTheme } = useDesktopTheme();
  const [stepIndex, setStepIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      setStepIndex(0);
      clearInterval(timerRef.current);
      return;
    }

    setStepIndex(0);
    let current = 0;

    timerRef.current = setInterval(() => {
      current++;
      if (current >= STATUS_STEPS.length) {
        clearInterval(timerRef.current);
        // Small delay after final status before completing
        setTimeout(() => {
          onComplete();
        }, 600);
        setStepIndex(STATUS_STEPS.length - 1);
      } else {
        setStepIndex(current);
      }
    }, STEP_INTERVAL);

    return () => {
      clearInterval(timerRef.current);
    };
  }, [visible, onComplete]);

  if (!visible) return null;

  const progress = ((stepIndex + 1) / STATUS_STEPS.length) * 100;
  const isMac = desktopTheme === 'mac';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000,
      }}
    >
      <div
        className="os-raised"
        style={{
          width: 340,
          padding: 0,
          fontFamily: isMac ? 'Chicago, Geneva, sans-serif' : 'MS Sans Serif, Tahoma, sans-serif',
          fontSize: 11,
        }}
      >
        {/* Title bar */}
        <div
          className="os-title-bar"
          style={{
            padding: '3px 6px',
            fontWeight: 'bold',
            fontSize: 11,
          }}
        >
          <span>Connecting to Internet...</span>
        </div>

        {/* Body */}
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Icon and status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 28 }}>
              {isMac ? '\uD83D\uDCDE' : '\uD83D\uDCBB'}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                Dial-Up Networking
              </div>
              <div>{STATUS_STEPS[stepIndex]}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div
            className="os-sunken"
            style={{
              height: 16,
              position: 'relative',
              background: '#fff',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${progress}%`,
                background: isMac ? '#000' : '#000080',
                transition: 'width 0.3s ease',
              }}
            />
          </div>

          {/* Cancel button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="os-btn os-raised"
              style={{ minWidth: 70 }}
              onClick={onComplete}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
