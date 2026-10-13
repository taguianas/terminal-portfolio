import { useState, useEffect, useRef } from 'react';
import { Power, Lock, LogOut, RotateCcw, PowerOff, Briefcase } from 'lucide-react';
import Tray from './Tray';
import { Logo, TerminalAppIcon, FolderIcon, BrowserAppIcon, EditorAppIcon, KaliVMIcon } from '../components/Icons';
import { APPS } from '../apps';
import { PANEL_H } from './Window';

export default function Panel({ windows, activeId, workspace, setWorkspace, menuOpen, onMenu, onLaunch, onTask, onPower, tray, onRecruiter }) {
  const [powerOpen, setPowerOpen] = useState(false);
  const powerRef = useRef(null);

  useEffect(() => {
    if (!powerOpen) return;
    const close = (e) => { if (!powerRef.current?.contains(e.target)) setPowerOpen(false); };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [powerOpen]);

  const launchers = [
    { app: 'files', Icon: FolderIcon, label: 'File Manager' },
    { app: 'terminal', Icon: TerminalAppIcon, label: 'Terminal Emulator' },
    { app: 'browser', Icon: BrowserAppIcon, label: 'Firefox ESR' },
    { app: 'editor', Icon: EditorAppIcon, label: 'Text Editor' },
    { app: 'kalivm', Icon: KaliVMIcon, label: 'Kali Linux (real VM)' },
  ];

  const tasks = windows.filter((w) => w.ws === workspace);

  return (
    <div
      className="absolute top-0 left-0 right-0 flex items-center bg-[#16171d]/95 backdrop-blur border-b border-black/60 text-[#dfe3ea] select-none"
      style={{ height: PANEL_H, zIndex: 100000 }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        data-menu-toggle
        onClick={onMenu}
        className={`h-full px-2 flex items-center ${menuOpen ? 'bg-[#367bf0]/40' : 'hover:bg-white/10'}`}
        title="Applications"
      >
        <Logo size={20} />
      </button>
      <Sep />
      {launchers.map(({ app, Icon, label }) => (
        <button key={app} onClick={() => onLaunch(app)} title={label} className="h-full px-1.5 flex items-center hover:bg-white/10">
          <Icon size={20} />
        </button>
      ))}
      <Sep />
      <div className="flex items-center gap-1 px-1.5">
        {[1, 2, 3, 4].map((n) => (
          <button
            key={n}
            onClick={() => setWorkspace(n)}
            title={`Workspace ${n}`}
            className={`w-[22px] h-[18px] rounded-sm text-[10px] font-bold flex items-center justify-center ${
              workspace === n ? 'bg-[#367bf0] text-white' : 'bg-[#2a2d37] text-[#8b93a3] hover:bg-[#363a46]'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <Sep />

      <div className="flex-1 flex items-center gap-1 px-1 min-w-0 overflow-hidden h-full">
        {tasks.map((w) => {
          const { Icon } = APPS[w.app];
          const on = w.id === activeId && !w.minimized;
          return (
            <button
              key={w.id}
              onClick={() => onTask(w.id)}
              title={w.title}
              className={`h-[24px] min-w-0 max-w-[200px] flex items-center gap-1.5 px-2 rounded-sm text-[12px] border-b-2 ${
                on ? 'bg-white/10 border-[#367bf0]' : 'border-transparent hover:bg-white/5'
              } ${w.minimized ? 'opacity-60' : ''}`}
            >
              <span className="shrink-0"><Icon size={15} /></span>
              <span className="truncate hidden md:inline">{w.title}</span>
            </button>
          );
        })}
      </div>

      <button onClick={onRecruiter} title="One-page profile for recruiters" className="h-[22px] mx-1.5 px-2.5 flex items-center gap-1.5 rounded bg-[#367bf0] hover:bg-[#4a8bff] text-white text-[12px] font-semibold whitespace-nowrap">
        <Briefcase size={13} /> <span className="hidden md:inline">Recruiter view</span>
      </button>
      <Tray {...tray} />
      <div ref={powerRef} className="relative h-full">
        <button onClick={() => setPowerOpen((o) => !o)} className={`h-full px-2.5 flex items-center ${powerOpen ? 'bg-white/10' : 'hover:bg-white/10'}`} title="Session">
          <Power size={15} />
        </button>
        {powerOpen && (
          <div className="absolute right-1 top-full mt-1 w-48 py-1 rounded-md bg-[#22242c] border border-[#363a46] shadow-2xl text-[13px]">
            {[
              ['lock', Lock, 'Lock Screen'],
              ['logout', LogOut, 'Log Out'],
              ['reboot', RotateCcw, 'Restart'],
              ['shutdown', PowerOff, 'Shut Down'],
            ].map(([a, I, l]) => (
              <button key={a} onClick={() => { setPowerOpen(false); onPower(a); }} className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#367bf0] hover:text-white text-left">
                <I size={14} /> {l}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Sep() {
  return <div className="w-px h-4 bg-white/15 mx-1" />;
}
