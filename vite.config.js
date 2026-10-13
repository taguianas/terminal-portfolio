import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The real Kali VM (CheerpX) needs SharedArrayBuffer, which browsers only
// allow on cross-origin isolated pages. Same headers as vercel.json.
const isolation = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
};

export default defineConfig({
  plugins: [react()],
  server: { headers: isolation },
  preview: { headers: isolation },
  optimizeDeps: { exclude: ['@leaningtech/cheerpx'] },
  build: { target: 'es2022' },
});
