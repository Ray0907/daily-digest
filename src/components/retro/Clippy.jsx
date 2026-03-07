import { useMemo } from 'react';

const MESSAGES = [
  "It looks like you're reading articles. Would you like help?",
  "Tip: Try right-clicking the desktop!",
  "Did you know? You can switch themes in Settings.",
  "Need help finding articles? Open Daily Digest!",
];

function getRandomMessage() {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}

export default function Clippy({ visible, onDismiss }) {
  const message = useMemo(() => getRandomMessage(), [visible]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 60,
        right: 20,
        zIndex: 3000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 8,
        cursor: 'pointer',
      }}
      onClick={onDismiss}
    >
      {/* Speech bubble */}
      <div
        style={{
          background: '#ffffcc',
          border: '1px solid #000',
          borderRadius: 8,
          padding: '10px 14px',
          maxWidth: 220,
          fontSize: 12,
          fontFamily: '"MS Sans Serif", Tahoma, sans-serif',
          color: '#000',
          position: 'relative',
          boxShadow: '2px 2px 0 rgba(0,0,0,0.2)',
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          style={{
            position: 'absolute',
            top: 2,
            right: 4,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 'bold',
            color: '#000',
            padding: 0,
            lineHeight: 1,
          }}
        >
          X
        </button>
        <p style={{ margin: 0, paddingRight: 12 }}>{message}</p>
        {/* Bubble tail */}
        <div
          style={{
            position: 'absolute',
            bottom: -8,
            right: 30,
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '8px solid #000',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -6,
            right: 31,
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '7px solid #ffffcc',
          }}
        />
      </div>

      {/* Clippy SVG */}
      <svg
        width="60"
        height="80"
        viewBox="0 0 60 80"
        style={{ filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.3))' }}
      >
        {/* Paperclip body */}
        <path
          d="M20,75 L20,25 Q20,10 30,10 Q40,10 40,25 L40,60 Q40,70 33,70 Q26,70 26,60 L26,30"
          fill="none"
          stroke="#8c8c8c"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M20,75 L20,25 Q20,10 30,10 Q40,10 40,25 L40,60 Q40,70 33,70 Q26,70 26,60 L26,30"
          fill="none"
          stroke="#b0b0b0"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Face background */}
        <ellipse cx="30" cy="28" rx="12" ry="10" fill="#d4d4d4" stroke="#8c8c8c" strokeWidth="1" />
        {/* Left eye white */}
        <ellipse cx="25" cy="26" rx="4" ry="5" fill="#fff" stroke="#666" strokeWidth="0.5" />
        {/* Right eye white */}
        <ellipse cx="35" cy="26" rx="4" ry="5" fill="#fff" stroke="#666" strokeWidth="0.5" />
        {/* Left pupil */}
        <circle cx="26" cy="27" r="2" fill="#000" />
        {/* Right pupil */}
        <circle cx="36" cy="27" r="2" fill="#000" />
        {/* Left eyebrow */}
        <path d="M22,20 Q25,18 28,20" fill="none" stroke="#666" strokeWidth="1" />
        {/* Right eyebrow */}
        <path d="M32,20 Q35,18 38,20" fill="none" stroke="#666" strokeWidth="1" />
        {/* Mouth */}
        <path d="M26,33 Q30,36 34,33" fill="none" stroke="#666" strokeWidth="1" />
        {/* Highlight on clip */}
        <path
          d="M22,72 L22,27 Q22,14 30,14"
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
