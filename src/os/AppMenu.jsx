import { useState, useEffect, useRef } from 'react';
import { Search, Lock, LogOut, Settings, Star, Clock3, LayoutGrid, Radar, Bug, Globe, Database, KeyRound, Wifi, Cpu, Crosshair, Network, Terminal as TermI, Fingerprint, FileText, Users, Wrench } from 'lucide-react';
import { CONFIG } from '../config';
import { Logo } from '../components/Icons';
import { PANEL_H } from './Window';

// Whisker-style application menu. Kali's tool categories are mapped
// to parts of the portfolio, so browsing the menu is browsing the CV.
export function buildMenu(act) {
  const I = (Icon, color) => function MenuIcon() { return <Icon size={22} color={color} />; };
  const items = {
    kalivm: { name: 'Kali Linux (real VM)', desc: 'A real Kali booted in your browser', Icon: I(TermI, '#5aa2ff'), run: () => act.app('kalivm') },
    terminal: { name: 'Terminal Emulator', desc: 'Use the command line', Icon: I(TermI, '#4fd16b'), run: () => act.app('terminal') },
    files: { name: 'File Manager', desc: 'Browse the file system', Icon: I(LayoutGrid, '#5aa2ff'), run: () => act.app('files') },
    firefox: { name: 'Firefox ESR', desc: 'Browse the World Wide Web', Icon: I(Globe, '#ff7139'), run: () => act.url('about:home') },
    editor: { name: 'Mousepad', desc: 'Text editor', Icon: I(FileText, '#f2a900'), run: () => act.app('editor') },
    about: { name: 'whoami', desc: 'About me (about.txt)', Icon: I(Fingerprint, '#5aa2ff'), run: () => act.file('about.txt') },
    nmap: { name: 'nmap', desc: 'Scan my skills (nmap anas)', Icon: I(Radar, '#4fd16b'), run: () => act.cmd(`nmap ${CONFIG.host}`) },
    skills: { name: 'skills.md', desc: 'Languages and tools', Icon: I(Cpu, '#c678dd'), run: () => act.file('skills.md') },
    edu: { name: 'education', desc: 'ESAIP and Warsaw exchange', Icon: I(Database, '#56b6c2'), run: () => act.file('education.txt') },
    msf: { name: 'metasploit framework', desc: 'My projects as exploit modules', Icon: I(Crosshair, '#ff6b6b'), run: () => act.cmd('msfconsole') },
    projects: { name: 'projects', desc: 'Open the projects folder', Icon: I(Bug, '#ff6b6b'), run: () => act.folder('projects') },
    securecrypt: { name: 'SecureCrypt', desc: 'AES-GCM / RSA-OAEP platform', Icon: I(KeyRound, '#e5c07b'), run: () => act.file('projects/SecureCrypt.txt') },
    snooker: { name: 'Snooker Shoot-Out', desc: 'Live tournament web app', Icon: I(Globe, '#4fd16b'), run: () => act.url('https://shootoutangers.netlify.app/') },
    github: { name: 'github', desc: 'Live repositories via the API', Icon: I(Network, '#e6e6e6'), run: () => act.cmd('github') },
    wifi: { name: 'ifconfig', desc: 'Network interfaces', Icon: I(Wifi, '#56b6c2'), run: () => act.cmd('ifconfig') },
    resume: { name: 'resume.pdf', desc: 'Read or download my resume', Icon: I(FileText, '#e5484d'), run: () => act.file('resume.pdf') },
    contact: { name: 'contact', desc: 'Email, LinkedIn, GitHub', Icon: I(Users, '#5aa2ff'), run: () => act.file('contact.info') },
    volunteering: { name: 'volunteering', desc: 'Cop1 Angers and more', Icon: I(Users, '#4fd16b'), run: () => act.file('volunteering.txt') },
    neofetch: { name: 'neofetch', desc: 'System information', Icon: I(Settings, '#9aa3b2'), run: () => act.cmd('neofetch') },
  };
  const cats = [
    ['Favorites', Star, ['kalivm', 'terminal', 'files', 'firefox', 'about', 'resume', 'contact']],
    ['Recently Used', Clock3, ['about', 'nmap', 'msf']],
    ['All Applications', LayoutGrid, Object.keys(items)],
    ['01 - Information Gathering', Radar, ['about', 'nmap', 'edu']],
    ['02 - Vulnerability Analysis', Bug, ['skills']],
    ['03 - Web Application Analysis', Globe, ['snooker', 'firefox']],
    ['05 - Password Attacks', KeyRound, ['securecrypt']],
    ['06 - Wireless Attacks', Wifi, ['wifi']],
    ['08 - Exploitation Tools', Crosshair, ['msf', 'projects', 'github']],
    ['12 - Reporting Tools', FileText, ['resume', 'volunteering']],
    ['13 - Social Engineering Tools', Users, ['contact']],
    ['Usual Applications', Wrench, ['kalivm', 'terminal', 'files', 'firefox', 'editor', 'neofetch']],
  ];
  return { items, cats };
}

export default function AppMenu({ menu, onClose, onPower }) {
  const [cat, setCat] = useState(0);
  const [q, setQ] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const close = (e) => {
      if (!ref.current?.contains(e.target) && !e.target.closest('[data-menu-toggle]')) onClose();
    };
    const esc = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', esc);
    };
  }, [onClose]);

  const keys = q
    ? Object.keys(menu.items).filter((k) => `${menu.items[k].name} ${menu.items[k].desc}`.toLowerCase().includes(q.toLowerCase()))
    : menu.cats[cat][2];

  const launch = (k) => { onClose(); menu.items[k].run(); };

  return (
    <div
      ref={ref}
      className="absolute left-1 w-[min(620px,calc(100vw-8px))] h-[min(470px,calc(100vh-40px))] flex flex-col rounded-md bg-[#1d1f26]/[.97] backdrop-blur border border-[#363a46] shadow-[0_20px_60px_rgba(0,0,0,0.7)] text-[#dfe3ea] text-[13px] wm-open"
      style={{ top: PANEL_H + 2, zIndex: 100001 }}
    >
      <div className="flex items-center gap-3 px-3 py-2.5 border-b border-[#2b2e38]">
        <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-[#2a2d37]"><Logo size={28} /></div>
        <div className="flex-1">
          <div className="font-semibold">{CONFIG.user}</div>
          <div className="text-[11.5px] text-[#8b93a3]">{CONFIG.fullName} | {CONFIG.title}</div>
        </div>
        <button title="Lock" onClick={() => { onClose(); onPower('lock'); }} className="p-1.5 rounded hover:bg-white/10"><Lock size={16} /></button>
        <button title="Log Out" onClick={() => { onClose(); onPower('logout'); }} className="p-1.5 rounded hover:bg-white/10"><LogOut size={16} /></button>
      </div>
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 h-8 px-2.5 rounded bg-[#14161d] border border-[#343846] focus-within:border-[#367bf0]">
          <Search size={14} className="text-[#8b93a3]" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && keys[0] && launch(keys[0])}
            placeholder="Search applications..."
            className="flex-1 bg-transparent outline-none placeholder:text-[#6b7383]"
          />
        </div>
      </div>
      <div className="flex-1 flex min-h-0 border-t border-[#2b2e38]">
        <div className="flex-1 overflow-y-auto p-1 kali-scroll">
          {keys.length === 0 && <div className="p-4 text-[#7b8494]">No applications found.</div>}
          {keys.map((k) => {
            const it = menu.items[k];
            return (
              <button key={k} onClick={() => launch(k)} className="w-full flex items-center gap-3 px-2.5 py-1.5 rounded text-left hover:bg-[#367bf0] hover:text-white group">
                <it.Icon />
                <div className="min-w-0">
                  <div className="truncate">{it.name}</div>
                  <div className="text-[11.5px] text-[#8b93a3] group-hover:text-white/80 truncate">{it.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="w-[46%] max-w-[250px] overflow-y-auto p-1 border-l border-[#2b2e38] kali-scroll">
          {menu.cats.map(([label, Icon], i) => (
            <button
              key={label}
              onMouseEnter={() => !q && setCat(i)}
              onClick={() => { setQ(''); setCat(i); }}
              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left truncate ${!q && cat === i ? 'bg-[#2f3340] text-white' : 'hover:bg-white/5 text-[#c4c9d3]'}`}
            >
              <Icon size={15} className="shrink-0" /> <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
