import { useState, useEffect } from 'react';
import { CONFIG } from '../config';

// Switchable desktop/login wallpaper, remembered per visitor.
// The Settings app changes it; Desktop and Login read it reactively.

const KEY = 'kali-wallpaper';
const listeners = new Set();

const lines = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='1600' height='900' viewBox='0 0 1600 900' preserveAspectRatio='none'>
    <g fill='none' stroke='#3b8eea' stroke-opacity='.10' stroke-width='1.2'>
      <path d='M-50 700 C 300 520, 600 820, 900 560 S 1400 380, 1700 520'/>
      <path d='M-50 740 C 320 560, 620 860, 920 600 S 1420 420, 1700 560'/>
      <path d='M-50 780 C 340 600, 640 900, 940 640 S 1440 460, 1700 600'/>
      <path d='M-50 200 C 400 360, 700 60, 1100 260 S 1500 160, 1700 240' stroke-opacity='.06'/>
    </g>
  </svg>`,
);

// A style object for each wallpaper id.
export const WALLPAPERS = [
  {
    id: 'kali-dragon',
    name: 'Your image',
    style: {
      backgroundColor: '#0b0e16',
      backgroundImage: [
        `url('${CONFIG.wallpaper}')`,
        `url("data:image/svg+xml,${lines}")`,
        'radial-gradient(ellipse 60% 55% at 72% 38%, rgba(54,123,240,0.28), transparent 70%)',
        'radial-gradient(ellipse 50% 50% at 15% 85%, rgba(54,123,240,0.12), transparent 70%)',
        'linear-gradient(160deg, #0d1220 0%, #0a0d16 55%, #05070b 100%)',
      ].join(', '),
      backgroundSize: 'cover, 100% 100%, auto, auto, auto',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    },
  },
  {
    id: 'blue-flow',
    name: 'Blue flow',
    style: {
      backgroundColor: '#0b0e16',
      backgroundImage: [
        `url("data:image/svg+xml,${lines}")`,
        'radial-gradient(ellipse 60% 55% at 72% 38%, rgba(54,123,240,0.28), transparent 70%)',
        'radial-gradient(ellipse 50% 50% at 15% 85%, rgba(54,123,240,0.12), transparent 70%)',
        'linear-gradient(160deg, #0d1220 0%, #0a0d16 55%, #05070b 100%)',
      ].join(', '),
      backgroundSize: '100% 100%, auto, auto, auto',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    },
  },
  {
    id: 'purple-haze',
    name: 'Purple haze',
    style: {
      backgroundColor: '#0d0a16',
      backgroundImage: [
        'radial-gradient(ellipse 60% 55% at 75% 30%, rgba(124,60,196,0.35), transparent 70%)',
        'radial-gradient(ellipse 55% 50% at 20% 90%, rgba(214,55,76,0.18), transparent 70%)',
        'linear-gradient(160deg, #160f24 0%, #0d0a16 55%, #060509 100%)',
      ].join(', '),
      backgroundSize: 'cover',
    },
  },
  {
    id: 'matrix-green',
    name: 'Terminal green',
    style: {
      backgroundColor: '#05100a',
      backgroundImage: [
        'radial-gradient(ellipse 60% 55% at 70% 35%, rgba(47,163,107,0.28), transparent 70%)',
        'linear-gradient(160deg, #081a11 0%, #05100a 55%, #030805 100%)',
      ].join(', '),
      backgroundSize: 'cover',
    },
  },
  {
    id: 'carbon',
    name: 'Carbon',
    style: {
      backgroundColor: '#111317',
      backgroundImage: [
        'repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0 2px, transparent 2px 6px)',
        'radial-gradient(ellipse 70% 60% at 50% 20%, rgba(90,162,255,0.08), transparent 70%)',
        'linear-gradient(160deg, #15181e 0%, #0e1015 100%)',
      ].join(', '),
      backgroundSize: 'auto, cover, cover',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    style: {
      backgroundColor: '#05070b',
      backgroundImage: 'linear-gradient(160deg, #0a0d16 0%, #05070b 100%)',
      backgroundSize: 'cover',
    },
  },
];

export function getWallpaperId() {
  try { return localStorage.getItem(KEY) || WALLPAPERS[0].id; } catch { return WALLPAPERS[0].id; }
}
export function setWallpaperId(id) {
  try { localStorage.setItem(KEY, id); } catch { /* ignore */ }
  listeners.forEach((fn) => fn(id));
}
export function wallpaperStyleFor(id) {
  return (WALLPAPERS.find((w) => w.id === id) || WALLPAPERS[0]).style;
}

// Reactive hook used by Desktop and Login.
export function useWallpaperStyle() {
  const [id, setId] = useState(getWallpaperId);
  useEffect(() => {
    listeners.add(setId);
    return () => listeners.delete(setId);
  }, []);
  return wallpaperStyleFor(id);
}

// Back-compat: a static default (first visit, before any choice).
export const wallpaperStyle = wallpaperStyleFor(getWallpaperId());
