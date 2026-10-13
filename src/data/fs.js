import { CONFIG } from '../config';

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

const README = `
 Welcome to ${CONFIG.host}'s machine
 ===========================

 You just logged into my portfolio. It works like a real
 Kali Linux desktop, so use it the way you prefer:

   * Mouse:    double-click the icons on the desktop
               (about.txt, projects, resume.pdf ...)
   * Terminal: type "help" to see every command
               try:  ls   cat about.txt   nmap anas

 Quick links
   About me ........ about.txt
   Skills .......... skills.md
   Projects ........ projects/
   Resume (PDF) .... resume.pdf
   Contact ......... contact.info

 Have fun, and look around: there are a few hidden things.
`;

const ABOUT = `
Hello, friend.

I am ${CONFIG.fullName}, a cybersecurity engineering student and
full stack developer.

I am in my fourth year of engineering studies at ESAIP (Angers,
France), specializing in cybersecurity and networks, and I am
looking for a work-study program (alternance).

I like technical challenges in security and networks, and I want
to help keep your projects secure.

Next:  cat skills.md   |   ls projects   |   open resume.pdf
`;

const SKILLS = `
# Skills

## Languages
- Python / Bash
- JavaScript / React
- C / C++
- HTML / Tailwind CSS

## Security tools
- Metasploit / Burp Suite
- Wireshark

## DevOps
- Docker / Kubernetes

## Cryptography
- AES-GCM, RSA-OAEP, digital signatures (see projects/SecureCrypt.txt)

Tip: run "nmap anas" in the terminal for another view of this file.
`;

const EDUCATION = `
ESAIP, Angers, France
  Computer Engineering Program  |  2024 - 2027 (ongoing)
  Specialization in Cybersecurity and Networks.

Politechnika Warszawska, Warsaw, Poland
  University Exchange  |  February 2025 - July 2025
  Software Engineering, Cryptography, Databases,
  Computer Networks and Operating Systems.
`;

const VOLUNTEERING = `
Cop1 Angers
  Food Distribution Volunteer  |  September 2024 - Present
  Food distribution for Cop1 - Student Solidarity in Angers:
  logistics, welcoming students and distributing supplies.

Snooker club (affiliated with FFB)
  Built the Snooker Shoot-Out web app for the club.
  See projects/snooker-shootout.txt
`;

const CONTACT = `
Secure comm channels
--------------------
Email ..... ${CONFIG.email}
LinkedIn .. ${CONFIG.linkedin}
GitHub .... https://github.com/${CONFIG.github}

Open to work-study (alternance) opportunities in
cybersecurity, networks and systems.
`;

const SECURECRYPT = `
SecureCrypt - End-to-End Encryption Platform
============================================
Stack: MERN (MongoDB, Express, React, Node.js), Tailwind CSS,
       Node.js native crypto module

A full stack web application for secure text encryption,
decryption and digital signing directly from the browser.
It implements industry-standard algorithms (AES-GCM and
RSA-OAEP) to demonstrate secure data handling and
authenticity verification.

Code: https://github.com/${CONFIG.github}/encryption-app
`;

const SNOOKER = `
Snooker Shoot-Out - Tournament App
==================================
Stack: React.js

Web application built for a snooker club (affiliated with
FFB) to run "Shoot-Out" tournaments. It manages the match
timer, the shot clock, the score and fouls in real time
with a dynamic interface.

Live: https://shootoutangers.netlify.app/
`;

const PORTFOLIO = `
Kali Desktop Portfolio (this website)
=====================================
Stack: React, Tailwind CSS, Vite

A simulated Kali Linux machine running in the browser:
boot loader, login screen, Xfce-style desktop, window
manager, file manager, text editor, document viewer,
browser and a zsh-like terminal sharing one virtual
file system.

Code: https://github.com/${CONFIG.github}/terminal-portfolio
`;

const ZSH_HISTORY = `
sudo apt update && sudo apt full-upgrade -y
nmap -sV 10.10.10.0/24
cd ~/projects
git push origin main
echo "hire me" > /dev/recruiter
`;

const FLAG = `
FLAG{y0u_f0und_th3_h1dd3n_f1l3}

Nice recon. Mention this flag when you contact me ;)
`;

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
      'skills.md': file(SKILLS),
      'education.txt': file(EDUCATION),
      'volunteering.txt': file(VOLUNTEERING),
      'contact.info': file(CONTACT),
      'resume.pdf': { type: 'pdf', src: CONFIG.resume },
      projects: dir({
        'SecureCrypt.txt': file(SECURECRYPT),
        'snooker-shootout.txt': file(SNOOKER),
        'kali-portfolio.txt': file(PORTFOLIO),
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
