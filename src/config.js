// ---------------------------------------------------------------
//  Personal settings. Change these to make the machine yours.
// ---------------------------------------------------------------
//  Images: drop your files in /public with these names (or change
//  the paths below). If a file is missing, a dark Kali-style
//  fallback is used, so the site never looks broken.
// ---------------------------------------------------------------

export const CONFIG = {
  wallpaper: '/wallpaper.jpg', // desktop + login background
  logo: '/logo.png',           // menu button, login screen, neofetch
  resume: '/resume.pdf',

  user: 'visitor',
  host: 'anas',
  fullName: 'Anas Tagui',
  title: 'Cybersecurity Engineering Student',
  email: 'atagui.ir2027@esaip.org',
  github: 'taguianas',
  linkedin: 'https://www.linkedin.com/in/taguianas',

  osName: 'Kali GNU/Linux Rolling',

  // Real Kali VM (built by .github/workflows/kali-vm-image.yml and
  // published on GitHub Pages). Change the user/repo if you rename it.
  kaliImage: 'https://taguianas.github.io/terminal-portfolio/kali/kali.ext2',
};

// Sites that refuse to be shown inside another page (X-Frame-Options /
// CSP frame-ancestors). Firefox shows an "open in a new tab" page for
// them right away instead of a blank frame. Everything else loads live.
export const BLOCKED_HOSTS = [
  'github.com', 'linkedin.com', 'youtube.com', 'x.com', 'twitter.com',
  'facebook.com', 'instagram.com', 'reddit.com', 'stackoverflow.com',
  'duckduckgo.com', 'bing.com', 'netflix.com', 'amazon.com', 'chatgpt.com',
  'claude.ai', 'tryhackme.com', 'hackthebox.com', 'kali.org', 'offsec.com',
];
