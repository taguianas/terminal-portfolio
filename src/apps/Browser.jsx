import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home, Lock, Menu, X, Plus, ExternalLink, ShieldAlert, Search, Globe, Info } from 'lucide-react';
import { CONFIG, BLOCKED_HOSTS } from '../config';
import { useOS } from '../os/OSContext';
import { HOME } from '../data/fs';

// A working browser window: real web pages load inside it.
// The portfolio page is cross-origin isolated (needed by the Kali VM), so
// pages are loaded in "credentialless" iframes (Chrome / Edge 110+): no
// cookies are sent, and sites that refuse to be framed show a fallback.

const SEARCH = (q) => `https://www.google.com/search?igu=1&q=${encodeURIComponent(q)}`;
const HOME_URL = 'about:home';

const TILES = [
  { label: 'Google', url: 'https://www.google.com/webhp?igu=1', color: '#4285f4', letter: 'G' },
  { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Kali_Linux', color: '#3a3a3a', letter: 'W' },
  { label: 'Snooker App', url: 'https://shootoutangers.netlify.app/', color: '#1f8f4e', letter: 'SO' },
  { label: 'GitHub', url: `https://github.com/${CONFIG.github}`, color: '#24292f', letter: 'GH' },
  { label: 'LinkedIn', url: CONFIG.linkedin, color: '#0a66c2', letter: 'in' },
  { label: 'SecureCrypt', url: `https://github.com/${CONFIG.github}/encryption-app`, color: '#7a3cc4', letter: 'SC' },
  { label: 'Resume', url: 'file:resume', color: '#c4373c', letter: 'CV' },
  { label: 'Email me', url: `mailto:${CONFIG.email}`, color: '#b8860b', letter: '@' },
];

const BOOKMARKS = [
  ['Kali Linux', 'https://en.wikipedia.org/wiki/Kali_Linux'],
  ['OWASP Top 10', 'https://en.wikipedia.org/wiki/OWASP'],
  ['Snooker App', 'https://shootoutangers.netlify.app/'],
  ['Google', 'https://www.google.com/webhp?igu=1'],
];

const supportsCredentialless = typeof HTMLIFrameElement !== 'undefined' && 'credentialless' in HTMLIFrameElement.prototype;

function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

function isBlocked(url) {
  const h = hostOf(url);
  return BLOCKED_HOSTS.some((b) => h === b || h.endsWith('.' + b));
}

function toUrl(input) {
  const v = input.trim();
  if (!v) return null;
  if (v.startsWith('about:')) return v;
  if (/^https?:\/\//i.test(v)) return v;
  if (/^[\w-]+(\.[\w-]+)+(:\d+)?(\/.*)?$/.test(v)) return `https://${v}`;
  return SEARCH(v);
}

let tabSeq = 1;
const newTab = (url = HOME_URL) => ({ id: tabSeq++, hist: [url], idx: 0, reload: 0 });

// ------------------------------------------------------------------
export default function Browser({ url: startUrl = HOME_URL, setTitle }) {
  const os = useOS();
  const [tabs, setTabs] = useState(() => [newTab(startUrl)]);
  const [activeId, setActiveId] = useState(() => tabs[0].id);
  const tab = tabs.find((t) => t.id === activeId) || tabs[0];
  const url = tab.hist[tab.idx];
  const [bar, setBar] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setBar(url === HOME_URL ? '' : url);
    setTitle?.(`${url === HOME_URL ? 'New Tab' : hostOf(url) || url} - Firefox ESR`);
  }, [url, setTitle]);

  const updateTab = (id, fn) => setTabs((ts) => ts.map((t) => (t.id === id ? fn(t) : t)));

  const nav = (u) => {
    if (!u) return;
    if (u === 'file:resume') { os.openPath([...HOME, 'resume.pdf']); return; }
    if (u.startsWith('mailto:')) { window.location.href = u; return; }
    updateTab(tab.id, (t) => ({ ...t, hist: [...t.hist.slice(0, t.idx + 1), u], idx: t.idx + 1 }));
  };

  const go = (d) => updateTab(tab.id, (t) => ({ ...t, idx: Math.max(0, Math.min(t.hist.length - 1, t.idx + d)) }));
  const reload = () => updateTab(tab.id, (t) => ({ ...t, reload: t.reload + 1 }));

  const addTab = (u = HOME_URL) => {
    const t = newTab(u);
    setTabs((ts) => [...ts, t]);
    setActiveId(t.id);
  };

  const closeTab = (id) => {
    setTabs((ts) => {
      if (ts.length === 1) return [newTab()];
      const i = ts.findIndex((t) => t.id === id);
      const rest = ts.filter((t) => t.id !== id);
      if (id === activeId) setActiveId(rest[Math.max(0, i - 1)].id);
      return rest;
    });
  };

  const submit = (e) => {
    e.preventDefault();
    nav(toUrl(bar));
  };

  const title = (u) => (u === HOME_URL ? 'New Tab' : hostOf(u) || u);

  return (
    <div className="h-full flex flex-col bg-[#1c1b22] text-[#fbfbfe] text-[13px]">
      {/* tab strip */}
      <div className="flex items-end h-9 px-2 gap-1 bg-[#0f0e13] select-none overflow-x-auto">
        {tabs.map((t) => {
          const u = t.hist[t.idx];
          const on = t.id === activeId;
          return (
            <div
              key={t.id}
              onMouseDown={() => setActiveId(t.id)}
              onAuxClick={(e) => e.button === 1 && closeTab(t.id)}
              className={`flex items-center gap-2 h-8 px-3 min-w-[120px] max-w-[220px] rounded-t-md cursor-default ${on ? 'bg-[#2b2a33]' : 'hover:bg-[#1c1b22]'}`}
            >
              {u === HOME_URL ? <span className="w-3.5 h-3.5 rounded-full bg-[#ff7139] shrink-0" /> : <Favicon url={u} />}
              <span className="truncate flex-1 text-[12.5px]">{title(u)}</span>
              <button onMouseDown={(e) => e.stopPropagation()} onClick={() => closeTab(t.id)} className="p-0.5 rounded opacity-60 hover:opacity-100 hover:bg-white/10"><X size={12} /></button>
            </div>
          );
        })}
        <button onClick={() => addTab()} className="h-8 px-2 opacity-70 hover:opacity-100" title="New tab"><Plus size={15} /></button>
      </div>

      {/* nav bar */}
      <form onSubmit={submit} className="flex items-center gap-1 h-10 px-2 bg-[#2b2a33]">
        <NavBtn disabled={tab.idx === 0} onClick={() => go(-1)} title="Back"><ArrowLeft size={16} /></NavBtn>
        <NavBtn disabled={tab.idx >= tab.hist.length - 1} onClick={() => go(1)} title="Forward"><ArrowRight size={16} /></NavBtn>
        <NavBtn onClick={reload} title="Reload"><RotateCw size={15} className={loading ? 'animate-spin' : ''} /></NavBtn>
        <NavBtn onClick={() => nav(HOME_URL)} title="Home"><Home size={15} /></NavBtn>
        <div className="flex-1 flex items-center gap-2 h-8 px-3 mx-1 rounded-md bg-[#1c1b22] border border-transparent focus-within:border-[#00ddff]">
          {url === HOME_URL ? <Search size={14} className="opacity-60" /> : <Lock size={13} className="opacity-70" />}
          <input
            value={bar}
            onChange={(e) => setBar(e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder="Search with Google or enter address"
            className="flex-1 min-w-0 bg-transparent outline-none placeholder:text-[#8f8f9d]"
            spellCheck={false}
          />
        </div>
        {url !== HOME_URL && !url.startsWith('about:') && (
          <a href={url} target="_blank" rel="noreferrer" title="Open in a real tab" className="p-1.5 rounded hover:bg-white/10"><ExternalLink size={15} /></a>
        )}
        <NavBtn title="Menu"><Menu size={16} /></NavBtn>
      </form>

      {/* bookmarks bar */}
      <div className="flex items-center gap-1 h-7 px-2 bg-[#2b2a33] border-b border-[#0f0e13] text-[12px] overflow-x-auto">
        {BOOKMARKS.map(([l, u]) => (
          <button key={l} type="button" onClick={() => nav(u)} className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/10 whitespace-nowrap">
            <Globe size={12} className="opacity-70" /> {l}
          </button>
        ))}
      </div>

      {/* page */}
      <div className="flex-1 min-h-0 relative bg-white">
        {url === HOME_URL ? (
          <StartPage onGo={nav} />
        ) : url === 'about:support' ? (
          <Unsupported url={url} />
        ) : isBlocked(url) ? (
          <Refused url={url} />
        ) : !supportsCredentialless ? (
          <Unsupported url={url} />
        ) : (
          <WebView key={`${tab.id}-${url}-${tab.reload}`} url={url} onLoading={setLoading} />
        )}
      </div>
    </div>
  );
}

// Real page in a credentialless iframe. The attribute must be set before
// the src, so the element is created by hand.
function WebView({ url, onLoading }) {
  const box = useRef(null);
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const f = document.createElement('iframe');
    f.credentialless = true;
    f.setAttribute('credentialless', '');
    f.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals');
    f.setAttribute('referrerpolicy', 'no-referrer');
    f.setAttribute('allow', 'fullscreen');
    f.title = url;
    f.className = 'w-full h-full border-0 bg-white';
    onLoading(true);
    const t = setTimeout(() => setSlow(true), 6000);
    f.onload = () => { onLoading(false); clearTimeout(t); };
    f.src = url;
    box.current.appendChild(f);
    return () => { clearTimeout(t); f.remove(); onLoading(false); };
  }, [url, onLoading]);
  return (
    <div className="h-full flex flex-col">
      <div ref={box} className="flex-1 min-h-0" />
      <div className={`shrink-0 flex items-center gap-2 px-3 py-1 text-[11.5px] border-t ${slow ? 'bg-[#fff4d6] text-[#5c4400] border-[#f0d58a]' : 'bg-[#f0f0f4] text-[#5b5b66] border-[#e0e0e6]'}`}>
        <Info size={12} />
        <span className="truncate">Page blank or "refused to connect"? That site does not allow being shown inside other pages.</span>
        <a href={url} target="_blank" rel="noreferrer" className="ml-auto shrink-0 text-[#0061e0] hover:underline flex items-center gap-1">Open in a new tab <ExternalLink size={11} /></a>
      </div>
    </div>
  );
}

function Favicon({ url }) {
  const [ok, setOk] = useState(true);
  const h = hostOf(url);
  if (!ok || !h) return <Globe size={13} className="opacity-70 shrink-0" />;
  return <img src={`https://icons.duckduckgo.com/ip3/${h}.ico`} alt="" crossOrigin="anonymous" className="w-3.5 h-3.5 shrink-0" onError={() => setOk(false)} />;
}

function StartPage({ onGo }) {
  const [q, setQ] = useState('');
  return (
    <div className="h-full overflow-y-auto flex flex-col items-center justify-center gap-8 p-6 bg-[#1c1b22] text-[#fbfbfe]">
      <div className="text-center">
        <div className="text-2xl font-light tracking-wide">{CONFIG.fullName}</div>
        <div className="text-[#a8a8b3] mt-1">{CONFIG.title}</div>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onGo(toUrl(q)); }} className="w-full max-w-md flex items-center gap-2 h-11 px-4 rounded-lg bg-[#2b2a33] border border-transparent focus-within:border-[#00ddff]">
        <Search size={16} className="opacity-60" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the web" className="flex-1 bg-transparent outline-none placeholder:text-[#8f8f9d]" />
      </form>
      <div className="grid grid-cols-4 gap-3">
        {TILES.map((t) => (
          <button key={t.label} type="button" onClick={() => onGo(t.url)} className="flex flex-col items-center gap-2 w-24 p-2 rounded-lg hover:bg-white/5">
            <span className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow" style={{ background: t.color }}>{t.letter}</span>
            <span className="text-[12px] text-[#d0d0d7]">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Refused({ url }) {
  return (
    <div className="h-full overflow-y-auto flex items-center justify-center p-6 bg-[#1c1b22] text-[#fbfbfe]">
      <div className="max-w-md">
        <ShieldAlert size={40} className="text-[#ffa436] mb-4" />
        <div className="text-xl mb-2">{hostOf(url)} refuses to be shown here</div>
        <div className="text-[#a8a8b3] mb-5 leading-relaxed">
          This site forbids other websites from displaying it inside a frame (X-Frame-Options / CSP frame-ancestors).
          It is a protection against clickjacking. Open it in a real tab instead.
        </div>
        <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#0061e0] hover:bg-[#0250bb] text-white">
          <ExternalLink size={15} /> Open {hostOf(url)} in a new tab
        </a>
      </div>
    </div>
  );
}

function Unsupported({ url }) {
  return (
    <div className="h-full overflow-y-auto flex items-center justify-center p-6 bg-[#1c1b22] text-[#fbfbfe]">
      <div className="max-w-md">
        <Info size={36} className="text-[#00ddff] mb-4" />
        <div className="text-xl mb-2">Use Chrome or Edge to browse here</div>
        <div className="text-[#a8a8b3] mb-5 leading-relaxed">
          This window shows real websites with "credentialless" frames, which your browser does not support yet.
        </div>
        <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[#0061e0] hover:bg-[#0250bb] text-white">
          <ExternalLink size={15} /> Open {hostOf(url)} in a new tab
        </a>
      </div>
    </div>
  );
}

function NavBtn({ children, disabled, onClick, title }) {
  return (
    <button type="button" title={title} disabled={disabled} onClick={onClick} className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent">
      {children}
    </button>
  );
}
