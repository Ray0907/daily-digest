import { useEffect, useRef } from 'react';

const OVERLAY_STYLE = {
  position: 'fixed',
  inset: 0,
  zIndex: 5000,
  background: '#000',
  cursor: 'none',
};

const HINT_STYLE = {
  position: 'absolute',
  bottom: 24,
  left: 0,
  right: 0,
  textAlign: 'center',
  color: 'rgba(255,255,255,0.25)',
  fontSize: 11,
  fontFamily: 'monospace',
  pointerEvents: 'none',
};

/* ── Win95 Starfield ────────────────────────────────────── */

function Starfield({ onDismiss }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animId;

    const NUM_STARS = 200;
    const stars = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function initStar() {
      return {
        x: (Math.random() - 0.5) * canvas.width,
        y: (Math.random() - 0.5) * canvas.height,
        z: Math.random() * canvas.width,
      };
    }

    resize();
    for (let i = 0; i < NUM_STARS; i++) {
      stars.push(initStar());
    }

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    function draw() {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.z -= 4;

        if (s.z <= 0) {
          stars[i] = initStar();
          stars[i].z = canvas.width;
          continue;
        }

        const sx = (s.x / s.z) * canvas.width + cx;
        const sy = (s.y / s.z) * canvas.height + cy;
        const r = Math.max(0, (1 - s.z / canvas.width) * 2.5);

        if (sx < 0 || sx > canvas.width || sy < 0 || sy > canvas.height) {
          stars[i] = initStar();
          stars[i].z = canvas.width;
          continue;
        }

        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%' }}
    />
  );
}

/* ── Mac Flying Toasters ────────────────────────────────── */

const TOASTER_COUNT = 5;

function toasterStyle(index) {
  const duration = 8 + index * 2;
  const delay = index * 1.5;
  const startTop = -80 - index * 60;
  const startLeft = 100 + index * 18 + '%';

  return {
    position: 'absolute',
    top: startTop,
    left: startLeft,
    fontSize: 48,
    animation: `fly-toaster ${duration}s linear ${delay}s infinite`,
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
  };
}

function FlyingToasters() {
  const toasters = Array.from({ length: TOASTER_COUNT }, (_, i) => i);

  return (
    <>
      <style>{`
        @keyframes fly-toaster {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(-120vw, 120vh) rotate(-15deg);
            opacity: 1;
          }
        }
        @keyframes flap {
          0%, 100% { transform: scaleX(1); }
          50% { transform: scaleX(-1); }
        }
        .toaster-wings {
          display: inline-block;
          animation: flap 0.4s ease-in-out infinite;
        }
      `}</style>
      {toasters.map((i) => (
        <div key={i} style={toasterStyle(i)}>
          <span className="toaster-wings" role="img" aria-label="toaster">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Wings */}
              <path d="M10 16 Q2 8 8 4 Q14 0 18 8 Z" fill="#ccc" stroke="#888" strokeWidth="1"/>
              <path d="M38 16 Q46 8 40 4 Q34 0 30 8 Z" fill="#ccc" stroke="#888" strokeWidth="1"/>
              {/* Toaster body */}
              <rect x="10" y="16" width="28" height="24" rx="3" fill="#d0d0d0" stroke="#666" strokeWidth="1.5"/>
              {/* Slot */}
              <rect x="16" y="14" width="16" height="4" rx="1" fill="#444"/>
              {/* Toast popping out */}
              <rect x="18" y="8" width="12" height="10" rx="1" fill="#d4a04a" stroke="#a0762a" strokeWidth="1"/>
              {/* Lever */}
              <rect x="38" y="24" width="4" height="8" rx="1" fill="#888"/>
            </svg>
          </span>
        </div>
      ))}
    </>
  );
}

/* ── Main ScreenSaver Component ─────────────────────────── */

export default function ScreenSaver({ theme, onDismiss }) {
  useEffect(() => {
    function handleInput() {
      onDismiss();
    }

    window.addEventListener('keydown', handleInput);
    window.addEventListener('mousemove', handleInput);
    window.addEventListener('click', handleInput);

    return () => {
      window.removeEventListener('keydown', handleInput);
      window.removeEventListener('mousemove', handleInput);
      window.removeEventListener('click', handleInput);
    };
  }, [onDismiss]);

  return (
    <div style={OVERLAY_STYLE}>
      {theme === 'win95' ? <Starfield /> : <FlyingToasters />}
      <div style={HINT_STYLE}>Press any key to return</div>
    </div>
  );
}
