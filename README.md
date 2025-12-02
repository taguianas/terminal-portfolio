# 🖥️ Kali Linux Terminal Portfolio

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

> **"Welcome to the shadows."**
> An immersive, interactive terminal-style portfolio designed for cybersecurity specialists and full-stack developers.

---

## 📖 Overview

This project is a **gamified personal portfolio** that simulates a fully functional Linux terminal (ZSH shell on Kali Linux) directly in the web browser. 

Unlike traditional static portfolios, this application demonstrates technical proficiency immediately upon loading. It features a working virtual file system, command parser, tab autocompletion, and real-time API integrations, all wrapped in a responsive, retro-styled CLI interface.

**Live Demo:** [https://atagui.vercel.app/]

---

## ✨ Key Features

### 🛠️ Core Functionality
* **Interactive Shell:** Type commands just like in a real terminal (`cd`, `ls`, `cat`, `pwd`, etc.).
* **Virtual File System:** Navigate directories, read files, and explore project structures.
* **Smart Autocomplete:** Press `TAB` to auto-complete commands and filenames.
* **Command History:** Use `UP` / `DOWN` arrows to cycle through previous commands.
* **Click-to-Action:** "Lazy recruiter" friendly—click any folder to `cd` into it, or any file to `cat` (read) it instantly.

### 🎨 Visuals & UX
* **Authentic Kali Theme:** Neon green text, dark background, and custom prompt styling (`visitor@anas`).
* **Theme Switcher:** Change color schemes on the fly (`theme ubuntu`, `theme cyber`).
* **Boot Sequence:** Simulates a systemd boot process (skippable on refresh for better UX).
* **CRT Effect:** Subtle scanlines and text glow for that retro hacker aesthetic.
* **Mobile Optimized:** Includes a custom mobile toolbar (ESC, TAB, Arrows) for easy navigation on touchscreens.

### 🌐 Integrations & Easter Eggs
* **GitHub API:** `github <username>` fetches live repository stats.
* **Weather API:** `weather <city>` fetches real-time ASCII weather reports.
* **Matrix Mode:** `matrix` triggers a falling code rain visual effect.
* **Self-Destruct:** Try running `rm -rf /` ... if you dare.
* **Sudo:** Try gaining root access to see custom error handling.

---

## 🚀 Quick Start

### Prerequisites
* Node.js (v16 or higher)
* npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/taguianas/terminal-portfolio.git](https://github.com/taguianas/terminal-portfolio.git)
    cd terminal-portfolio
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  Open `http://localhost:5173` in your browser.

---

## ⌨️ Available Commands

Type `help` in the terminal to see this list organized by category.

### Navigation & Files
| Command | Description |
| :--- | :--- |
| **`ls`** | List directory contents (files & folders) |
| **`cd <dir>`** | Change directory (e.g., `cd projects`) |
| **`cat <file>`** | Read file content (e.g., `cat about.txt`) |
| **`pwd`** | Print working directory |
| **`mkdir <dir>`** | Create a directory (simulated) |
| **`touch <file>`** | Create a file (simulated) |

### System & Utils
| Command | Description |
| :--- | :--- |
| **`clear`** | Clear the terminal screen |
| **`whoami`** | Display current user |
| **`theme <name>`** | Change UI theme (`kali`, `ubuntu`, `cyber`) |
| **`fetch`** | Display system information (Neofetch style) |

### External & Fun
| Command | Description |
| :--- | :--- |
| **`resume`** | **Download the PDF resume** |
| **`github <user>`** | Fetch top repositories for a GitHub user |
| **`weather <city>`** | Fetch live weather for a specific city |
| **`matrix`** | Enter the Matrix (Press any key to exit) |

---

## 📂 Project Structure

```text
.
├── public/
│   └── resume.pdf       # The downloadable resume file
├── src/
│   ├── assets/          # Static assets (images, icons)
│   ├── App.jsx          # Main application logic (Terminal, File System)
│   ├── index.css        # Global styles & Tailwind directives
│   └── main.jsx         # React entry point
├── index.html           # HTML entry point
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
├── vite.config.js       # Vite bundler configuration
└── package.json         # Project dependencies and scripts.
```

## ⚙️ Customization

To personalize this portfolio for yourself:

1.  **Edit Content:** Open `src/App.jsx` and modify the `INITIAL_FILE_SYSTEM` object. This is where you change the text inside `about.txt`, `skills.md`, etc.
2.  **Change Links:** Search for the `projects` object in `src/App.jsx` to update your GitHub repository links.
3.  **Update Resume:** Replace `public/resume.pdf` with your actual resume file.

---

## 🛠️ Built With

* [React](https://reactjs.org/) - Frontend library for component-based UI.
* [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework for styling.
* [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling for fast builds.
* [Lucide React](https://lucide.dev/) - Beautiful & consistent icons.

---

## 👨‍💻 Author

**Anas Tagui**
* **Role:** Cyber Security Specialist & Full Stack Developer
* **GitHub:** [@anas-tagui](https://github.com/taguianas)
* **Email:** [atagui.ir2027@esaip.org](mailto:atagui.ir2027@esaip.org)
