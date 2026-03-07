import { useState, useEffect, useRef, useCallback } from 'react';

const BOOT_DURATION_WIN95 = 2000;
const BOOT_DURATION_MAC = 1500;
const CRT_POWER_ON_MS = 300;
const FADE_OUT_MS = 400;

export default function BootScreen({ theme = 'win95', onComplete }) {
  const [phase, setPhase] = useState('crt'); // crt | boot | fadeout | done
  const completeCalled = useRef(false);

  const finish = useCallback(() => {
    if (completeCalled.current) return;
    completeCalled.current = true;
    onComplete?.();
  }, [onComplete]);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      finish();
      return;
    }

    // Phase 1: CRT power-on
    const crtTimer = setTimeout(() => setPhase('boot'), CRT_POWER_ON_MS);
    return () => clearTimeout(crtTimer);
  }, [finish]);

  // Phase 2: Boot animation
  useEffect(() => {
    if (phase !== 'boot') return;
    const duration = theme === 'mac' ? BOOT_DURATION_MAC : BOOT_DURATION_WIN95;
    const timer = setTimeout(() => setPhase('fadeout'), duration);
    return () => clearTimeout(timer);
  }, [phase, theme]);

  // Phase 3: Fade out
  useEffect(() => {
    if (phase !== 'fadeout') return;
    const timer = setTimeout(() => {
      setPhase('done');
      finish();
    }, FADE_OUT_MS);
    return () => clearTimeout(timer);
  }, [phase, finish]);

  if (phase === 'done') return null;

  const isWin95 = theme === 'win95';
  const bootDuration = isWin95 ? BOOT_DURATION_WIN95 : BOOT_DURATION_MAC;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 4000,
        backgroundColor: isWin95 ? '#000' : '#C0C0C0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: phase === 'fadeout' ? 0 : 1,
        transition: phase === 'fadeout' ? `opacity ${FADE_OUT_MS}ms ease-out` : 'none',
      }}
    >
      {/* CRT power-on wrapper */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          animation: phase === 'crt' ? `crtPowerOn ${CRT_POWER_ON_MS}ms ease-out forwards` : 'none',
          transform: phase === 'crt' ? 'scaleY(0)' : 'scaleY(1)',
        }}
      >
        {isWin95 ? (
          <Win95Content phase={phase} bootDuration={bootDuration} />
        ) : (
          <MacContent phase={phase} bootDuration={bootDuration} />
        )}
      </div>

      <style>{`
        @keyframes crtPowerOn {
          0% { transform: scaleY(0); }
          60% { transform: scaleY(0.02); }
          100% { transform: scaleY(1); }
        }
        @keyframes bootProgressFill {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}

function Win95Content({ phase, bootDuration }) {
  return (
    <>
      {/* Win95 logo box */}
      <div
        style={{
          border: '3px solid #fff',
          padding: '18px 36px',
          marginBottom: 18,
          opacity: phase === 'boot' ? 1 : 0,
          transition: 'opacity 0.4s ease-in',
        }}
      >
        <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
          <span style={{ color: '#FF0000', fontSize: 28, fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>W</span>
          <span style={{ color: '#00AA00', fontSize: 28, fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>i</span>
          <span style={{ color: '#0000FF', fontSize: 28, fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>n</span>
          <span style={{ color: '#FFAA00', fontSize: 28, fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>d</span>
          <span style={{ color: '#FF0000', fontSize: 28, fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>o</span>
          <span style={{ color: '#00AA00', fontSize: 28, fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>w</span>
          <span style={{ color: '#0000FF', fontSize: 28, fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>s</span>
          <span style={{ color: '#FFAA00', fontSize: 28, fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>9</span>
          <span style={{ color: '#FF0000', fontSize: 28, fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>5</span>
        </div>
      </div>

      <div
        style={{
          color: '#fff',
          fontSize: 16,
          fontFamily: '"MS Sans Serif", Arial, sans-serif',
          marginBottom: 32,
          opacity: phase === 'boot' ? 1 : 0,
          transition: 'opacity 0.4s ease-in 0.2s',
        }}
      >
        Daily Digest 95
      </div>

      {/* Progress bar */}
      {phase === 'boot' && (
        <div
          style={{
            width: 260,
            height: 20,
            border: '2px solid #808080',
            backgroundColor: '#000',
            padding: 2,
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: '#0000AA',
              animation: `bootProgressFill ${bootDuration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </>
  );
}

function MacContent({ phase, bootDuration }) {
  return (
    <>
      {/* Happy Mac icon */}
      <div
        style={{
          fontSize: 64,
          marginBottom: 16,
          opacity: phase === 'boot' ? 1 : 0,
          transition: 'opacity 0.3s ease-in',
          color: '#000',
        }}
      >
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="4" width="48" height="40" rx="4" stroke="#000" strokeWidth="3" fill="#fff" />
          <rect x="14" y="10" width="36" height="26" rx="2" fill="#000" />
          <circle cx="26" cy="20" r="3" fill="#fff" />
          <circle cx="38" cy="20" r="3" fill="#fff" />
          <path d="M24 28 Q32 34 40 28" stroke="#fff" strokeWidth="2" fill="none" />
          <rect x="24" y="48" width="16" height="4" rx="1" fill="#000" />
          <rect x="18" y="52" width="28" height="3" rx="1" fill="#000" />
        </svg>
      </div>

      <div
        style={{
          color: '#000',
          fontSize: 18,
          fontFamily: 'Chicago, "Geneva", serif',
          marginBottom: 32,
          opacity: phase === 'boot' ? 1 : 0,
          transition: 'opacity 0.3s ease-in 0.15s',
        }}
      >
        Welcome to Macintosh
      </div>

      {/* Progress bar */}
      {phase === 'boot' && (
        <div
          style={{
            width: 220,
            height: 14,
            border: '2px solid #000',
            backgroundColor: '#fff',
            borderRadius: 7,
            padding: 2,
          }}
        >
          <div
            style={{
              height: '100%',
              backgroundColor: '#000',
              borderRadius: 5,
              animation: `bootProgressFill ${bootDuration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </>
  );
}
