import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home, Lock, Menu, X, Plus, ExternalLink, ShieldAlert, Search } from 'lucide-react';
import { CONFIG, EMBEDDABLE_HOSTS } from '../config';
import { useOS } from '../os/OSContext';
import { HOME } from '../data/fs';

const TILES = [
  { label: 'GitHub', url: `https://github.com/${CONFIG.github}`, color: '#24292f', letter: 'GH' },
  { label: 'LinkedIn', url: CONFIG.linkedin, color: '#0a66c2', letter: 'in' },
  { label: 'Snooker App', url: 'https://shootoutangers.netlify.app/', color: '#1f8f4e', letter: 'SO' },
  { label: 'SecureCrypt', url: `https://github.com/${CONFIG.github}/encryption-app`, color: '#7a3cc4', letter: 'SC' },
  { label: 'Resume', url: 'file:resume', color: '#c4373c', letter: 'CV' },
  { label: 'Email me', url: `mailto:${CONFIG.email}`, color: '#b8860b', letter: '@' },
];

function hostOf(url) {
  try { return new URL(url).hostname; } catch { return ''; }
}

export default function Browser({ url: startUrl = 'about:home', setTitle }) {
  const os = useOS();
  const [hist, setHist] = useState([startUrl]);
  const [idx, setIdx] = useState(0);
  const [bar, setBar] = useState(startUrl === 'about:home' ? '' : startUrl);
  const [reload, setReload] = useState(0);
  const url = hist[idx];

  useEffect(() => {
    setBar(url === 'about:home' ? '' : url);
    const t = url === 'about:home' ? 'New Tab' : hostOf(url) || url;
    setTitle?.(`${t} - Firefox ESR`);
  }, [url, setTitle]);

  const nav = (u) => {
    if (u === 'file:resume') { os.openPath([...HOME, 'resume.pdf']); return; }
    if (u.startsWith('mailto:')) { window.location.href = u; return; }
    setHist((h) => [...h.slice(0, idx + 1), u]);
    setIdx((i) => i + 1);
  };

  const submit = (e) => {
    e.preventDefault();
    const v = bar.trim();
    if (!v) return;
    if (/^https?:\/\//.test(v)) nav(v);
    else if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(v)) nav(`https://${v}`);
    else nav(`https://duckduckgo.com/?q=${encodeURIComponent(v)}`);
  };

  const embeddable = EMBEDDABLE_HOSTS.includes(hostOf(url));
  const tabTitle = url === 'about:home' ? 'New Tab' : hostOf(url);

  return (
    <div className="h-full flex flex-col bg-[#1c1b22] text-[#fbfbfe] text-[13px]">
      {/* tab strip */}
      <div className="flex items-end h-9 px-2 gap-1 bg-[#0f0e13] select-none">
        <div className="flex items-center gap-2 h-8 px-3 min-w-[180px] max-w-[240px] rounded-t-md bg-[#2b2a33]">
          <span className="w-3.5 h-3.5 rounded-full bg-[#ff7139]" />
          <span className="truncate flex-1 text-[12.5px]">{tabTitle}</span>
          <X size={13} className="opacity-60" />
        </div>
        <button className="h-8 px-2 opacity-70 hover:opacity-100"><Plus size={15} /></button>
      </div>
      {/* nav bar */}
      <form onSubmit={submit} className="flex items-center gap-1 h-10 px-2 bg-[#2b2a33] border-b border-[#0f0e13]">
        <NavBtn disabled={idx === 0} onClick={() => setIdx(idx - 1)}><ArrowLeft size={16} /></NavBtn>
        <NavBtn disabled={idx >= hist.length - 1} onClick={() => setIdx(idx + 1)}><ArrowRight size={16} /></NavBtn>
        <NavBtn onClick={() => setReload((r) => r + 1)}><RotateCw size={15} /></NavBtn>
        <NavBtn onClick={() => nav('about:home')}><Home size={15} /></NavBtn>
        <div className="flex-1 flex items-center gap-2 h-8 px-3 mx-1 rounded-md bg-[#1c1b22] border border-transparent focus-within:border-[#00ddff]">
          {url === 'about:home' ? <Search size={14} className="opacity-60" /> : <Lock size={13} className="opacity-70" />}
          <input
            value={bar}
            onChange={(e) => setBar(e.target.value)}
            placeholder="Search with DuckDuckGo or enter address"
            className="flex-1 min-w-0 bg-transparent outline-none placeholder:text-[#8f8f9d]"
            spellCheck={false}
          />
        </div>
        {url !== 'about:home' && (
          <a href={url} target="_blank" rel="noreferrer" title="Open in a real tab" className="p-1.5 rounded hover:bg-white/10"><ExternalLink size={15} /></a>
        )}
        <NavBtn><Menu size={16} /></NavBtn>
      </form>

      {/* page */}
      <div className="flex-1 min-h-0 bg-[#1c1b22] relative">
        {url === 'about:home' ? (
          <div className="h-full overflow-y-auto flex flex-col items-center justify-center gap-8 p-6">
            <div className="text-center">
              <div className="text-2xl font-light tracking-wide">{CONFIG.fullName}</div>
              <div className="text-[#a8a8b3] mt-1">{CONFIG.title}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {TILES.map((t) => (
                <button key={t.label} type="button" onClick={() => nav(t.url)} className="flex flex-col items-center gap-2 w-24 p-2 rounded-lg hover:bg-white/5">
                  <span className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow" style={{ background: t.color }}>{t.letter}</span>
                  <span className="text-[12px] text-[#d0d0d7]">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : embeddable ? (
          <iframe key={reload} title={url} src={url} className="w-full h-full border-0 bg-white" />
        ) : (
          <div className="h-full overflow-y-auto flex items-center justify-center p-6">
            <div className="max-w-md">
              <ShieldAlert size={40} className="text-[#ffa436] mb-4" />
              <div className="text-xl mb-2">This site can't be shown inside the portfolio</div>
              <div className="text-[#a8a8b3] mb-5 leading-relaxed">
                <span className="text-white">{hostOf(url)}</span> does not allow other websites to embed it
                (X-Frame-Options). You can open it in a real browser tab instead.
              </div>
              <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#0061e0] hover:bg-[#0250bb] text-white">
                <ExternalLink size={15} /> Open {hostOf(url)} in a new tab
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function NavBtn({ children, disabled, onClick }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent">
      {children}
    </button>
  );
}
