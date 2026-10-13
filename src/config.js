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
  linkedin: 'https://www.linkedin.com/in/anas-tagui-7b0599241/',

  osName: 'Kali GNU/Linux Rolling',
};

// Sites that are allowed to load inside the fake Firefox window.
// Most big sites (GitHub, LinkedIn, Google) refuse to be embedded,
// so for those the browser shows an "open in a new tab" page instead.
export const EMBEDDABLE_HOSTS = ['shootoutangers.netlify.app', 'atagui.vercel.app'];
