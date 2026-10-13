import { CONFIG } from '../config.js';

// ---------------------------------------------------------------
//  Virtual file system. Everything a visitor can open, from the
//  desktop, the file manager or the terminal, lives here.
//  Node types:
//    dir   { children }
//    file  { content }           opens in the text editor / cat
//    pdf   { src }               opens in the document viewer
//    link  { url }               opens in Firefox
// ---------------------------------------------------------------

const file = (content) => ({ type: 'file', content: content.replace(/^\n/, '') });
const dir = (children = {}, extra = {}) => ({ type: 'dir', children, ...extra });

export const HOME = ['home', CONFIG.user];

import {
  README, ABOUT, SKILLS, EXPERIENCE, EDUCATION, CERTIFICATIONS, CONTACT,
  P_PHISHGUARD, P_SOCLAB, P_MCP, P_SECURECRYPT, P_REDTEAM, P_ADMIN, P_PORTFOLIO,
  README_LABS, L_ENDGAME, L_OWASP, L_SMURF, ZSH_HISTORY, FLAG,
} from './content.js';

export const INITIAL_FS = dir({
  bin: dir(),
  boot: dir(),
  etc: dir({
    hostname: file(`${CONFIG.host}\n`),
    'os-release': file(`
PRETTY_NAME="${CONFIG.osName}"
NAME="Kali GNU/Linux"
VERSION_ID="2026.3"
ID=kali
ID_LIKE=debian
`),
    motd: file('\nThe programs included with the Kali GNU/Linux system are free software.\n'),
    shadow: { type: 'file', content: '', locked: true },
  }),
  home: dir({
    [CONFIG.user]: dir({
      'README.txt': file(README),
      'about.txt': file(ABOUT),
      'experience.txt': file(EXPERIENCE),
      'skills.md': file(SKILLS),
      'education.txt': file(EDUCATION),
      'certifications.txt': file(CERTIFICATIONS),
      'contact.info': file(CONTACT),
      'resume.pdf': { type: 'pdf', src: CONFIG.resume },
      projects: dir({
        'PhishGuard-AI.txt': file(P_PHISHGUARD),
        'SOC-Home-Lab.txt': file(P_SOCLAB),
        'Kali-MCP-Server.txt': file(P_MCP),
        'SecureCrypt.txt': file(P_SECURECRYPT),
        'RedTeam-Framework.txt': file(P_REDTEAM),
        'Admin-Script.txt': file(P_ADMIN),
        'kali-portfolio.txt': file(P_PORTFOLIO),
      }),
      labs: dir({
        'README.txt': file(README_LABS),
        'endgame-ad.txt': file(L_ENDGAME),
        'owasp-web.txt': file(L_OWASP),
        'smurf-dos.txt': file(L_SMURF),
      }),
      '.zsh_history': file(ZSH_HISTORY),
      '.flag.txt': file(FLAG),
      '.Trash': dir({
        'imposter_syndrome.txt': file('\nDeleted. Permanently.\n'),
      }),
    }),
  }),
  opt: dir(),
  root: dir({}, { locked: true }),
  tmp: dir(),
  usr: dir({ bin: dir(), share: dir() }),
  var: dir({ log: dir() }),
});

// ------------------------- helpers -----------------------------

export function getNode(fs, path) {
  let cur = fs;
  for (const seg of path) {
    if (!cur || cur.type !== 'dir' || !cur.children[seg]) return null;
    cur = cur.children[seg];
  }
  return cur;
}

export function resolvePath(cwd, target) {
  if (!target || target === '~') return [...HOME];
  let parts = target.split('/').filter(Boolean);
  let out = [...cwd];
  if (target.startsWith('/')) out = [];
  else if (target.startsWith('~')) {
    out = [...HOME];
    parts = parts.slice(1);
  }
  for (const p of parts) {
    if (p === '.') continue;
    if (p === '..') out.pop();
    else out.push(p);
  }
  return out;
}

export function absPath(path) {
  return '/' + path.join('/');
}

export function displayPath(path) {
  const isHome = HOME.every((s, i) => path[i] === s);
  if (isHome) {
    const rest = path.slice(HOME.length);
    return rest.length ? '~/' + rest.join('/') : '~';
  }
  return absPath(path);
}

export function listDir(node, showHidden = false) {
  if (!node || node.type !== 'dir') return [];
  return Object.entries(node.children)
    .filter(([name]) => showHidden || !name.startsWith('.'))
    .sort(([a, na], [b, nb]) => {
      if (na.type === 'dir' && nb.type !== 'dir') return -1;
      if (nb.type === 'dir' && na.type !== 'dir') return 1;
      return a.localeCompare(b);
    });
}

// Immutable update of the node at `path`.
export function updateAt(fs, path, fn) {
  if (path.length === 0) return fn(fs);
  const [head, ...rest] = path;
  const child = fs.children?.[head];
  if (!child) return fs;
  return { ...fs, children: { ...fs.children, [head]: updateAt(child, rest, fn) } };
}

export function nodeSize(node) {
  if (node.type === 'dir') return 4096;
  if (node.type === 'pdf') return 152668;
  return (node.content || '').length;
}
