// Writes the portfolio files from src/data/fs.js into kali-vm/home/
// so the real Kali VM has the same files as the desktop.
//   node kali-vm/export-home.mjs
import { mkdirSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { INITIAL_FS, HOME, getNode } from '../src/data/fs.js';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'home');
const publicDir = join(here, '..', 'public');

rmSync(out, { recursive: true, force: true });

function write(node, dir) {
  mkdirSync(dir, { recursive: true });
  for (const [name, child] of Object.entries(node.children)) {
    if (name === '.zsh_history') continue; // keep the VM's real history clean
    const p = join(dir, name);
    if (child.type === 'dir') write(child, p);
    else if (child.type === 'pdf') copyFileSync(join(publicDir, child.src.replace(/^\//, '')), p);
    else if (child.type === 'file') writeFileSync(p, child.content);
  }
}

write(getNode(INITIAL_FS, HOME), out);
console.log(`exported ${HOME.join('/')} -> ${out}`);
