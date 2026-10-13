// Firmware (UEFI) settings, saved in the visitor's browser.
// Every option has a real effect somewhere in the portfolio:
//   fastBoot     skip the GRUB menu (App.jsx)
//   timeout      GRUB countdown in seconds (Grub.jsx)
//   quietBoot    off = every kernel message is shown at boot (Grub.jsx)
//   bootFirst    'kali' or 'pxe' (network boot attempt first) (Grub.jsx)
//   secureBoot   on = GRUB refuses the unsigned Kali kernel (Grub.jsx)
//   vtx          off = the real Kali VM cannot start (KaliVM.jsx)
//   audio        off = no system sounds (sound.js)
//   adminPw      SHA-256 hash, asked before entering the setup utility
//   userPw       SHA-256 hash, asked before booting

const KEY = 'kali-firmware';

export const DEFAULTS = {
  fastBoot: false,
  timeout: 5,
  quietBoot: true,
  bootFirst: 'kali',
  secureBoot: false,
  vtx: true,
  audio: true,
  adminPw: null,
  userPw: null,
};

export function getFirmware() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    // migrate the old standalone fast boot flag
    const legacy = localStorage.getItem('kali-fastboot') === '1';
    return { ...DEFAULTS, ...(legacy ? { fastBoot: true } : {}), ...(raw || {}) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveFirmware(fw) {
  try {
    localStorage.setItem(KEY, JSON.stringify(fw));
    localStorage.removeItem('kali-fastboot');
  } catch { /* storage blocked */ }
}

export async function hashPassword(pw) {
  const data = new TextEncoder().encode(`kali-portfolio:${pw}`);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
