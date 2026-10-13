import { getFirmware } from './firmware';
// Tiny system sounds made with the Web Audio API (no audio files).
// The volume comes from the panel's volume control.

const KEY = 'kali-volume';
let ctx = null;
const listeners = new Set();

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    if (v && typeof v.level === 'number') return v;
  } catch { /* ignore */ }
  return { level: 60, muted: false };
}

let state = load();

export function getVolume() {
  return state;
}

export function setVolume(patch) {
  state = { ...state, ...patch };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  listeners.forEach((fn) => fn(state));
}

export function onVolume(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

const SOUNDS = {
  // [frequency Hz, start s, duration s]
  notify: [[880, 0, 0.09], [1320, 0.09, 0.14]],
  login: [[523, 0, 0.12], [659, 0.12, 0.12], [784, 0.24, 0.22]],
  error: [[220, 0, 0.15], [180, 0.16, 0.2]],
  click: [[1000, 0, 0.03]],
  test: [[660, 0, 0.12], [880, 0.14, 0.18]],
};

export function play(name = 'notify') {
  if (state.muted || state.level <= 0 || !getFirmware().audio) return;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const gainMax = (state.level / 100) * 0.25;
    const now = ctx.currentTime;
    for (const [f, start, dur] of SOUNDS[name] || SOUNDS.notify) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      g.gain.setValueAtTime(0, now + start);
      g.gain.linearRampToValueAtTime(gainMax, now + start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.connect(g).connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.02);
    }
  } catch { /* audio not available */ }
}
