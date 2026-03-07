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
      {/* Win95 flag logo — pixel-style waving flag */}
      <div
        style={{
          marginBottom: 18,
          opacity: phase === 'boot' ? 1 : 0,
          transition: 'opacity 0.4s ease-in',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          imageRendering: 'pixelated',
        }}
      >
        <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
          {/* Flag pole */}
          <rect x="20" y="10" width="4" height="140" fill="#808080" />
          <rect x="21" y="10" width="2" height="140" fill="#C0C0C0" />
          {/* Red pane (top-left) — waving */}
          <path d="M28 14 C50 8, 75 18, 100 12 L100 62 C75 68, 50 58, 28 64 Z" fill="#FF0000" />
          {/* Green pane (top-right) */}
          <path d="M100 12 C125 6, 150 16, 172 10 L172 60 C150 66, 125 56, 100 62 Z" fill="#00AA00" />
          {/* Blue pane (bottom-left) */}
          <path d="M28 68 C50 62, 75 72, 100 66 L100 116 C75 122, 50 112, 28 118 Z" fill="#0000FF" />
          {/* Yellow pane (bottom-right) */}
          <path d="M100 66 C125 60, 150 70, 172 64 L172 114 C150 120, 125 110, 100 116 Z" fill="#FFAA00" />
          {/* Subtle shading on flag */}
          <path d="M28 14 C50 8, 75 18, 100 12 L100 20 C75 26, 50 16, 28 22 Z" fill="rgba(255,255,255,0.2)" />
          <path d="M100 12 C125 6, 150 16, 172 10 L172 18 C150 24, 125 14, 100 20 Z" fill="rgba(255,255,255,0.2)" />
        </svg>
        <div style={{
          color: '#fff',
          fontSize: 28,
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif',
          marginTop: 4,
          letterSpacing: 2,
        }}>
          <span style={{ color: '#FF0000' }}>W</span>
          <span style={{ color: '#00AA00' }}>i</span>
          <span style={{ color: '#0000FF' }}>n</span>
          <span style={{ color: '#FFAA00' }}>d</span>
          <span style={{ color: '#FF0000' }}>o</span>
          <span style={{ color: '#00AA00' }}>w</span>
          <span style={{ color: '#0000FF' }}>s</span>
          <span style={{ color: '#FFAA00' }}>9</span>
          <span style={{ color: '#FF0000' }}>5</span>
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
