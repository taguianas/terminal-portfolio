import { useState, useEffect, useRef } from 'react';
import { Wifi, Volume2, BatteryFull, Power, Lock, LogOut, RotateCcw, PowerOff, Bell } from 'lucide-react';
import { Logo, TerminalAppIcon, FolderIcon, BrowserAppIcon, EditorAppIcon } from '../components/Icons';
import { APPS } from '../apps';
import { PANEL_H } from './Window';

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);
  const day = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return (
    <span className="px-2 text-[12.5px] font-semibold tabular-nums whitespace-nowrap" title={now.toDateString()}>
      <span className="hidden lg:inline text-[#aeb4c0] font-normal mr-2">{day}</span>
      {time}
    </span>
  );
}

export default function Panel({ windows, activeId, workspace, setWorkspace, menuOpen, onMenu, onLaunch, onTask, onPower }) {
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

      <div className="flex items-center gap-2.5 px-2 text-[#c4c9d3]">
        <Bell size={14} className="hidden sm:block" />
        <Volume2 size={15} className="hidden sm:block" />
        <Wifi size={15} />
        <BatteryFull size={17} className="hidden sm:block" />
      </div>
      <Clock />
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
