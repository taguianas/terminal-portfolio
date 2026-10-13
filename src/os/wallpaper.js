import { CONFIG } from '../config';

// Your image (public/wallpaper.jpg) is the top layer. If it does not
// exist, the browser skips it and shows the dark fallback below it.
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

export const wallpaperStyle = {
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
};
