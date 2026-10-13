import { useState } from 'react';
import { CONFIG } from '../config';

// Large icons used on the desktop and in the file manager.
// All drawn here, no external artwork.

export function FolderIcon({ size = 48, open = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path d="M4 10a3 3 0 0 1 3-3h11l4 4h19a3 3 0 0 1 3 3v3H4z" fill="#2c6fd6" />
      <path d={open ? 'M2 18h44l-4 21a3 3 0 0 1-3 2H9a3 3 0 0 1-3-2z' : 'M4 15h40v23a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z'} fill="#4a90f5" />
      <path d="M4 15h40v3H4z" fill="#6aa8ff" opacity=".6" />
    </svg>
  );
}

export function DocIcon({ size = 48, ext = 'txt' }) {
  const color = ext === 'pdf' ? '#e5484d' : ext === 'md' ? '#2fa36b' : ext === 'info' ? '#d9a514' : '#7b8494';
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path d="M11 4h18l10 10v28a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="#eef1f6" />
      <path d="M29 4v8a2 2 0 0 0 2 2h8z" fill="#c7cdd8" />
      {ext !== 'pdf' && (
        <g stroke="#9aa3b2" strokeWidth="1.6" strokeLinecap="round">
          <path d="M15 20h18M15 25h18M15 30h14M15 35h16" />
        </g>
      )}
      <rect x="9" y="34" width="22" height="9" rx="1.5" fill={color} />
      <text x="20" y="41" textAnchor="middle" fontSize="6.5" fontFamily="sans-serif" fontWeight="700" fill="#fff">
        {ext.toUpperCase().slice(0, 4)}
      </text>
    </svg>
  );
}

export function TerminalAppIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <rect x="4" y="7" width="40" height="34" rx="4" fill="#1b1e26" stroke="#4b5263" strokeWidth="1.5" />
      <rect x="4" y="7" width="40" height="6" rx="3" fill="#2d313c" />
      <path d="M11 21l6 5-6 5" fill="none" stroke="#4fd16b" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 32h10" stroke="#e6e6e6" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function BrowserAppIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="19" fill="#2c6fd6" />
      <path d="M24 5a19 19 0 0 1 0 38M24 5a19 19 0 0 0 0 38M24 5c-6 6-6 32 0 38M24 5c6 6 6 32 0 38M6 18h36M6 30h36" fill="none" stroke="#bcd6ff" strokeWidth="1.5" />
    </svg>
  );
}

export function EditorAppIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <rect x="8" y="5" width="28" height="38" rx="3" fill="#eef1f6" />
      <g stroke="#9aa3b2" strokeWidth="1.6" strokeLinecap="round"><path d="M13 13h18M13 18h18M13 23h12" /></g>
      <path d="M40 18l4 4-16 16-6 2 2-6z" fill="#f2a900" stroke="#9c6c00" strokeWidth="1" />
    </svg>
  );
}

export function HomeIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <FolderPath />
      <path d="M24 20l-8 7h2.5v7h4v-5h3v5h4v-7H32z" fill="#e8f1ff" />
    </svg>
  );
}

export function DriveIcon({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <rect x="5" y="14" width="38" height="20" rx="3" fill="#59606e" />
      <rect x="5" y="14" width="38" height="12" rx="3" fill="#7a8291" />
      <circle cx="36" cy="29" r="1.8" fill="#4fd16b" />
      <path d="M10 29h16" stroke="#9aa3b2" strokeWidth="1.5" />
    </svg>
  );
}

export function TrashIcon({ size = 48, full = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path d="M11 13h26l-2.5 28a3 3 0 0 1-3 2.7h-15a3 3 0 0 1-3-2.7z" fill="#9aa3b2" />
      <rect x="8" y="8" width="32" height="5" rx="1.5" fill="#c7cdd8" />
      <g stroke="#6b7383" strokeWidth="1.8"><path d="M18 18v20M24 18v20M30 18v20" /></g>
      {full && <path d="M17 9l4-5 6 2 4 3" fill="#eef1f6" />}
    </svg>
  );
}

function FolderPath() {
  return (
    <>
      <path d="M4 10a3 3 0 0 1 3-3h11l4 4h19a3 3 0 0 1 3 3v3H4z" fill="#2c6fd6" />
      <path d="M4 15h40v23a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" fill="#4a90f5" />
    </>
  );
}

export function NodeIcon({ name, node, size = 48 }) {
  if (!node) return <DocIcon size={size} />;
  if (node.type === 'dir') return name === '.Trash' ? <TrashIcon size={size} /> : <FolderIcon size={size} />;
  if (node.type === 'pdf') return <DocIcon size={size} ext="pdf" />;
  const ext = name.includes('.') ? name.split('.').pop() : 'txt';
  return <DocIcon size={size} ext={ext} />;
}

// The user's logo (public/logo.png). Falls back to a neutral mark
// with the user's initials when the file is missing.
export function Logo({ size = 20, className = '' }) {
  const [failed, setFailed] = useState(false);
  if (!failed) {
    return (
      <img
        src={CONFIG.logo}
        alt=""
        width={size}
        height={size}
        className={`object-contain ${className}`}
        style={{ width: size, height: size }}
        onError={() => setFailed(true)}
        draggable={false}
      />
    );
  }
  const initials = CONFIG.fullName.split(' ').map((w) => w[0]).join('').slice(0, 2);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
      <rect x="1" y="1" width="30" height="30" rx="7" fill="#367bf0" />
      <text x="16" y="21" textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="sans-serif" fill="#fff">{initials}</text>
    </svg>
  );
}
