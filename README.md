# Kali Desktop Portfolio

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

A portfolio that boots like a Kali Linux machine in the browser: GRUB, systemd boot logs, a login screen, then an Xfce-style desktop with real windows. Visitors can explore it with the mouse (double-click icons) or with the terminal.

**Live demo:** https://atagui.vercel.app/

## Features

- **Boot sequence:** GRUB menu (arrow keys + Enter), systemd logs, LightDM-style login that types itself. Skipped on later visits in the same tab.
- **Desktop:** top panel with app menu, launchers, 4 workspaces, task buttons, clock and a session menu (lock, log out, restart, shut down). Right-click the desktop for a context menu. `Ctrl+Alt+T` opens a terminal.
- **Window manager:** drag, resize, minimize, maximize (double-click the title bar), focus and stacking.
- **Apps sharing one virtual file system:**
  - Terminal (zsh-style Kali prompt, TAB completion, history, clickable `ls`)
  - File Manager (places, breadcrumbs, back/forward, hidden files)
  - Mousepad text editor
  - Document Viewer for the resume PDF
  - Firefox with a start page of links
- **Portfolio commands:** `nmap anas` (skills as open ports), `msfconsole` (projects as modules), `neofetch`, `github`, `weather <city>`, `resume`, `contact`.
- **Easter eggs:** `sudo`, `rm -rf /`, `matrix`, hidden files (`ls -la`).
- **Files you create are real:** `touch notes.txt` or `echo hi > hi.txt` makes the file appear on the desktop.
- **Phones:** get a full-screen terminal with a touch toolbar.

## Quick start

```bash
git clone https://github.com/taguianas/terminal-portfolio.git
cd terminal-portfolio
npm install
npm run dev
```

Then open http://localhost:5173

## Make it yours

| What | Where |
| :--- | :--- |
| Wallpaper (desktop + login) | put an image at `public/wallpaper.jpg` |
| Logo (menu button, login, neofetch) | put an image at `public/logo.png` (square, transparent PNG works best) |
| Resume | replace `public/resume.pdf` |
| Name, user, host, links | `src/config.js` |
| Text of every file and folder | `src/data/fs.js` |
| App menu categories | `src/os/AppMenu.jsx` |
| Terminal commands | `src/apps/Terminal.jsx` |

If `wallpaper.jpg` or `logo.png` is missing, a dark Kali-style fallback is used.

## Project structure

```text
src/
├── App.jsx            # boot flow: grub -> boot -> login -> desktop
├── config.js          # your name, links, image paths
├── data/fs.js         # virtual file system (all portfolio content)
├── os/                # Desktop, Panel, AppMenu, Window, Boot screens, MobileShell
├── apps/              # Terminal, FileManager, TextEditor, PdfViewer, Browser
└── components/        # icons, link helper
```

## Disclaimer

Kali Linux is a trademark of OffSec Services Limited. This project is a personal portfolio inspired by its look and is not affiliated with or endorsed by OffSec.

## Author

**Anas Tagui**, cybersecurity engineering student at ESAIP
- GitHub: [@taguianas](https://github.com/taguianas)
- Email: [atagui.ir2027@esaip.org](mailto:atagui.ir2027@esaip.org)

## License

MIT
