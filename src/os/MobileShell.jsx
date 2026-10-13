import { useMemo, useState, useEffect } from 'react';
import { Wifi, BatteryFull, Monitor, X } from 'lucide-react';
import { OSContext } from './OSContext';
import Terminal from '../apps/Terminal';
import { getNode } from '../data/fs';
import { CONFIG } from '../config';
import { Logo } from '../components/Icons';

// Phones get the terminal only: windows don't fit on a small screen.
export default function MobileShell({ base }) {
  const [hint, setHint] = useState(true);
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);

  const os = useMemo(
    () => ({
      ...base,
      mobile: true,
      openApp: () => {},
      openUrl: (u) => { if (u !== 'about:home') window.open(u, '_blank', 'noopener'); },
      openPath: (path) => {
        const node = getNode(base.fs, path);
        if (node?.type === 'pdf') window.open(node.src, '_blank', 'noopener');
        return 'inline';
      },
    }),
    [base],
  );

  return (
    <OSContext.Provider value={os}>
      <div className="fixed inset-0 flex flex-col bg-[#14161d] font-ui" style={{ height: '100dvh' }}>
        <div className="h-8 shrink-0 flex items-center gap-2 px-2 bg-[#16171d] border-b border-black/60 text-[#dfe3ea] text-[12.5px]">
          <Logo size={18} />
          <span className="font-semibold truncate">{CONFIG.user}@{CONFIG.host}: ~</span>
          <div className="ml-auto flex items-center gap-2 text-[#c4c9d3]">
            <Wifi size={14} /><BatteryFull size={16} />
            <span className="font-semibold tabular-nums">{now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        {hint && (
          <div className="shrink-0 flex items-center gap-2 px-3 py-2 bg-[#1d2a44] text-[#cfe0ff] text-[12px]">
            <Monitor size={15} className="shrink-0" />
            <span>Open this site on a computer to boot the full Kali desktop.</span>
            <button onClick={() => setHint(false)} className="ml-auto p-1" aria-label="Dismiss"><X size={14} /></button>
          </div>
        )}
        <div className="flex-1 min-h-0">
          <Terminal mobile active />
        </div>
      </div>
    </OSContext.Provider>
  );
}
