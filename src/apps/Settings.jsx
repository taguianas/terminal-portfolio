import { useState, useRef, useEffect } from 'react';
import { Monitor, Cpu, Info, Trash2, Check, Image as ImageIcon, Volume2, Bell } from 'lucide-react';
import { CONFIG } from '../config';
import { WALLPAPERS, getWallpaperId, setWallpaperId } from '../os/wallpaper';
import { getVolume, setVolume } from '../os/sound';

const TABS = [
  { id: 'appearance', label: 'Appearance', icon: ImageIcon },
  { id: 'sound', label: 'Sound', icon: Volume2 },
  { id: 'about', label: 'About', icon: Info },
];

function sysInfo() {
  const nav = navigator;
  let gpu = 'Unknown';
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    const ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
    if (gl) gpu = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)).replace(/^ANGLE \((.*)\)$/, '$1').replace(/\s*\(0x[0-9a-f]+\).*$/i, '');
  } catch { /* no webgl */ }
  return {
    cores: nav.hardwareConcurrency || '?',
    memory: nav.deviceMemory ? `${nav.deviceMemory} GB` : 'n/a',
    gpu: gpu.slice(0, 48),
    screen: `${screen.width} x ${screen.height}`,
    lang: nav.language,
  };
}

export default function Settings({ setTitle }) {
  const [tab, setTab] = useState('appearance');
  const [wp, setWp] = useState(getWallpaperId);
  const [vol, setVol] = useState(getVolume);
  const info = useRef(sysInfo()).current;

  useEffect(() => { setTitle?.('Settings'); }, [setTitle]);

  const chooseWp = (id) => { setWp(id); setWallpaperId(id); };
  const changeVol = (patch) => { const v = { ...vol, ...patch }; setVol(v); setVolume(patch); };

  return (
    <div className="h-full flex bg-[#1f2129] text-[#dfe3ea] text-[13px]">
      {/* sidebar */}
      <div className="w-44 shrink-0 border-r border-[#2b2e38] py-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={`w-full flex items-center gap-2.5 px-4 py-2 text-left ${tab === id ? 'bg-[#367bf0] text-white' : 'hover:bg-[#2a2d37]'}`}>
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 kali-scroll">
        {tab === 'appearance' && (
          <div>
            <h2 className="text-[16px] font-semibold mb-1">Desktop wallpaper</h2>
            <p className="text-[#8b93a3] mb-4">Pick a background. Your choice is remembered and also used on the login screen.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl">
              {WALLPAPERS.map((w) => (
                <button key={w.id} onClick={() => chooseWp(w.id)} className="group text-left">
                  <div className="relative h-24 rounded-lg overflow-hidden border-2 transition-colors" style={{ ...w.style, borderColor: wp === w.id ? '#367bf0' : 'transparent' }}>
                    {wp === w.id && <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#367bf0] flex items-center justify-center"><Check size={13} className="text-white" /></span>}
                  </div>
                  <div className={`mt-1.5 text-[12.5px] ${wp === w.id ? 'text-white' : 'text-[#aeb4c0]'}`}>{w.name}</div>
                </button>
              ))}
            </div>
            <p className="text-[12px] text-[#7b8494] mt-4">Tip: drop your own image at <span className="font-mono text-[#c4c9d3]">public/wallpaper.jpg</span> and pick "Your image".</p>
          </div>
        )}

        {tab === 'sound' && (
          <div className="max-w-md">
            <h2 className="text-[16px] font-semibold mb-1">Sound</h2>
            <p className="text-[#8b93a3] mb-4">Desktop sounds: login, notifications and clicks.</p>
            <div className="flex items-center gap-3 mb-4">
              <button onClick={() => changeVol({ muted: !vol.muted })} className="p-2 rounded hover:bg-white/10"><Volume2 size={18} /></button>
              <input type="range" min={0} max={100} value={vol.muted ? 0 : vol.level} onChange={(e) => changeVol({ level: +e.target.value, muted: false })} className="flex-1 accent-[#367bf0]" />
              <span className="w-10 text-right tabular-nums text-[#aeb4c0]">{vol.muted ? 'off' : `${vol.level}%`}</span>
            </div>
            <label className="flex items-center gap-2.5 text-[#c4c9d3]">
              <input type="checkbox" checked={!vol.muted} onChange={(e) => changeVol({ muted: !e.target.checked })} className="accent-[#367bf0]" />
              <Bell size={15} /> Play notification sounds
            </label>
          </div>
        )}

        {tab === 'about' && (
          <div className="max-w-md">
            <h2 className="text-[16px] font-semibold mb-4">About this machine</h2>
            <div className="rounded-lg bg-[#14161d] border border-[#2b2e38] divide-y divide-[#2b2e38]">
              <Row icon={Monitor} k="OS" v={`${CONFIG.osName} (portfolio)`} />
              <Row icon={Cpu} k="Processor" v={`${info.cores} logical cores`} />
              <Row icon={Cpu} k="Memory" v={info.memory} />
              <Row icon={Monitor} k="Graphics" v={info.gpu} />
              <Row icon={Monitor} k="Resolution" v={info.screen} />
              <Row icon={Info} k="Owner" v={CONFIG.fullName} />
            </div>
            <button
              onClick={() => { try { localStorage.clear(); sessionStorage.clear(); } catch { /* ignore */ } location.reload(); }}
              className="mt-5 flex items-center gap-2 px-3 py-2 rounded bg-[#5a2328] hover:bg-[#6e2b31] text-[#ffb4b4] text-[12.5px]"
            >
              <Trash2 size={14} /> Reset this machine (clears saved settings and reboots)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ icon: Icon, k, v }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <Icon size={15} className="text-[#6b7383]" />
      <span className="w-28 text-[#8b93a3]">{k}</span>
      <span className="flex-1 text-right">{v}</span>
    </div>
  );
}
