import React from "react";

export function BrowserIcon({ size = 32, variant = "win95" }) {
  if (variant === "mac") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="13" stroke="black" strokeWidth="2" fill="white" />
        <ellipse cx="16" cy="16" rx="6" ry="13" stroke="black" strokeWidth="1.5" fill="none" />
        <line x1="3" y1="16" x2="29" y2="16" stroke="black" strokeWidth="1.5" />
        <line x1="5" y1="9" x2="27" y2="9" stroke="black" strokeWidth="1" />
        <line x1="5" y1="23" x2="27" y2="23" stroke="black" strokeWidth="1" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" fill="#4169E1" stroke="#000080" strokeWidth="1.5" />
      <ellipse cx="16" cy="16" rx="6" ry="13" stroke="white" strokeWidth="1.5" fill="none" />
      <line x1="3" y1="16" x2="29" y2="16" stroke="white" strokeWidth="1.5" />
      <line x1="5" y1="9" x2="27" y2="9" stroke="white" strokeWidth="1" />
      <line x1="5" y1="23" x2="27" y2="23" stroke="white" strokeWidth="1" />
      <path d="M14 3 Q20 8 22 16 Q24 24 18 29" stroke="#FFD700" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function GraphIcon({ size = 32, variant = "win95" }) {
  if (variant === "mac") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="8" cy="8" r="3" fill="black" />
        <circle cx="24" cy="6" r="3" fill="black" />
        <circle cx="16" cy="16" r="3.5" fill="black" />
        <circle cx="6" cy="24" r="3" fill="black" />
        <circle cx="26" cy="24" r="3" fill="black" />
        <line x1="8" y1="8" x2="16" y2="16" stroke="black" strokeWidth="1.5" />
        <line x1="24" y1="6" x2="16" y2="16" stroke="black" strokeWidth="1.5" />
        <line x1="6" y1="24" x2="16" y2="16" stroke="black" strokeWidth="1.5" />
        <line x1="26" y1="24" x2="16" y2="16" stroke="black" strokeWidth="1.5" />
        <line x1="8" y1="8" x2="6" y2="24" stroke="black" strokeWidth="1" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="8" cy="8" r="3" fill="#FF6347" stroke="#8B0000" strokeWidth="1" />
      <circle cx="24" cy="6" r="3" fill="#32CD32" stroke="#006400" strokeWidth="1" />
      <circle cx="16" cy="16" r="3.5" fill="#FFD700" stroke="#B8860B" strokeWidth="1" />
      <circle cx="6" cy="24" r="3" fill="#1E90FF" stroke="#00008B" strokeWidth="1" />
      <circle cx="26" cy="24" r="3" fill="#FF69B4" stroke="#8B0045" strokeWidth="1" />
      <line x1="8" y1="8" x2="16" y2="16" stroke="#808080" strokeWidth="1.5" />
      <line x1="24" y1="6" x2="16" y2="16" stroke="#808080" strokeWidth="1.5" />
      <line x1="6" y1="24" x2="16" y2="16" stroke="#808080" strokeWidth="1.5" />
      <line x1="26" y1="24" x2="16" y2="16" stroke="#808080" strokeWidth="1.5" />
      <line x1="8" y1="8" x2="6" y2="24" stroke="#808080" strokeWidth="1" />
    </svg>
  );
}

export function ArchiveIcon({ size = 32, variant = "win95" }) {
  if (variant === "mac") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect x="4" y="6" width="24" height="20" rx="1" fill="white" stroke="black" strokeWidth="2" />
        <path d="M4 6 L16 2 L28 6" stroke="black" strokeWidth="2" fill="white" />
        <line x1="4" y1="13" x2="28" y2="13" stroke="black" strokeWidth="1.5" />
        <line x1="4" y1="20" x2="28" y2="20" stroke="black" strokeWidth="1.5" />
        <rect x="13" y="14" width="6" height="4" rx="1" fill="black" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="6" width="24" height="20" rx="1" fill="#C0A030" stroke="#806020" strokeWidth="1.5" />
      <path d="M4 6 L16 2 L28 6" stroke="#806020" strokeWidth="1.5" fill="#D4B040" />
      <line x1="4" y1="13" x2="28" y2="13" stroke="#806020" strokeWidth="1.5" />
      <line x1="4" y1="20" x2="28" y2="20" stroke="#806020" strokeWidth="1.5" />
      <rect x="13" y="14" width="6" height="4" rx="1" fill="#FFD700" stroke="#806020" strokeWidth="1" />
    </svg>
  );
}

export function SettingsIcon({ size = 32, variant = "win95" }) {
  if (variant === "mac") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="5" fill="white" stroke="black" strokeWidth="2" />
        <circle cx="16" cy="16" r="2" fill="black" />
        {[0, 45, 90, 135].map((angle) => (
          <rect
            key={angle}
            x="14"
            y="2"
            width="4"
            height="8"
            rx="1"
            fill="black"
            transform={`rotate(${angle} 16 16)`}
          />
        ))}
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="5" fill="#C0C0C0" stroke="#808080" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="2" fill="#404040" />
      {[0, 45, 90, 135].map((angle) => (
        <rect
          key={angle}
          x="14"
          y="2"
          width="4"
          height="8"
          rx="1"
          fill="#808080"
          stroke="#404040"
          strokeWidth="0.5"
          transform={`rotate(${angle} 16 16)`}
        />
      ))}
    </svg>
  );
}

export function ComputerIcon({ size = 32, variant = "win95" }) {
  if (variant === "mac") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect x="4" y="3" width="24" height="18" rx="2" fill="white" stroke="black" strokeWidth="2" />
        <rect x="7" y="6" width="18" height="12" fill="black" />
        <rect x="12" y="23" width="8" height="3" fill="black" />
        <rect x="8" y="26" width="16" height="2" rx="1" fill="black" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="3" width="24" height="18" rx="1" fill="#C0C0C0" stroke="#808080" strokeWidth="1.5" />
      <rect x="7" y="6" width="18" height="12" fill="#008080" />
      <rect x="12" y="23" width="8" height="3" fill="#C0C0C0" stroke="#808080" strokeWidth="1" />
      <rect x="8" y="26" width="16" height="2" rx="1" fill="#C0C0C0" stroke="#808080" strokeWidth="1" />
      <circle cx="25" cy="18" r="1" fill="#00FF00" />
    </svg>
  );
}

export function TrashIcon({ size = 32, variant = "win95" }) {
  if (variant === "mac") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect x="9" y="6" width="14" height="2" fill="black" />
        <rect x="13" y="4" width="6" height="3" rx="1" fill="white" stroke="black" strokeWidth="1.5" />
        <path d="M8 8 L10 28 L22 28 L24 8 Z" fill="white" stroke="black" strokeWidth="2" />
        <line x1="13" y1="12" x2="13" y2="24" stroke="black" strokeWidth="1.5" />
        <line x1="16" y1="12" x2="16" y2="24" stroke="black" strokeWidth="1.5" />
        <line x1="19" y1="12" x2="19" y2="24" stroke="black" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="9" y="6" width="14" height="2" fill="#808080" />
      <rect x="13" y="4" width="6" height="3" rx="1" fill="#C0C0C0" stroke="#808080" strokeWidth="1" />
      <path d="M8 8 L10 28 L22 28 L24 8 Z" fill="#C0C0C0" stroke="#808080" strokeWidth="1.5" />
      <line x1="13" y1="12" x2="13" y2="24" stroke="#808080" strokeWidth="1.5" />
      <line x1="16" y1="12" x2="16" y2="24" stroke="#808080" strokeWidth="1.5" />
      <line x1="19" y1="12" x2="19" y2="24" stroke="#808080" strokeWidth="1.5" />
      <path d="M11 8 L16 11 L21 8" stroke="#008000" strokeWidth="2" fill="none" />
      <path d="M11 28 L16 25 L21 28" stroke="#008000" strokeWidth="2" fill="none" />
    </svg>
  );
}

export function AboutIcon({ size = 32, variant = "win95" }) {
  if (variant === "mac") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="13" fill="white" stroke="black" strokeWidth="2" />
        <text x="16" y="22" textAnchor="middle" fontSize="18" fontWeight="bold" fontFamily="serif" fill="black">?</text>
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="13" fill="#000080" stroke="#000050" strokeWidth="1.5" />
      <text x="16" y="22" textAnchor="middle" fontSize="18" fontWeight="bold" fontFamily="serif" fill="#FFFF00">?</text>
    </svg>
  );
}
