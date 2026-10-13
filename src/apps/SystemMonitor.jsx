import { useState, useEffect, useRef } from 'react';
import { Cpu, MemoryStick, Activity, Clock } from 'lucide-react';
import { CONFIG } from '../config';

// A Task Manager / htop-style monitor. The CPU and memory figures are
// real (measured from this browser tab); the process list mixes the real
// page with the Kali daemons you would expect to see running.

const BOOT = Date.now();

const DAEMONS = [
  ['systemd', 'root', '/sbin/init'],
  ['NetworkManager', 'root', '/usr/sbin/NetworkManager'],
  ['wazuh-agentd', 'root', '/var/ossec/bin/wazuh-agentd'],
  ['postgres', 'postgres', 'postgres: wazuh-indexer'],
  ['Xorg', 'root', '/usr/lib/xorg/Xorg :0'],
  ['xfwm4', CONFIG.user, 'xfwm4 --display :0'],
  ['xfce4-panel', CONFIG.user, 'xfce4-panel'],
  ['wireshark', CONFIG.user, 'wireshark -k -i eth0'],
  ['firefox-esr', CONFIG.user, '/usr/lib/firefox-esr/firefox-esr'],
  ['pipewire', CONFIG.user, '/usr/bin/pipewire'],
  ['cron', 'root', '/usr/sbin/cron -f'],
  ['sshd', 'root', 'sshd: /usr/sbin/sshd -D'],
];

function usePids() {
  const ref = useRef(null);
  if (!ref.current) {
    let pid = 480;
    ref.current = DAEMONS.map(([name, user, cmd]) => ({ pid: (pid += Math.floor(Math.random() * 120) + 7), name, user, cmd, cpu: Math.random() * 2, mem: 0.3 + Math.random() * 3 }));
    ref.current.unshift({ pid: 1337, name: 'chromium', user: CONFIG.user, cmd: 'portfolio (this tab)', cpu: 4, mem: 6, self: true });
  }
  return ref.current;
}

function Bar({ pct, color }) {
  return (
    <div className="h-2 rounded bg-[#14161d] overflow-hidden">
      <div className="h-full rounded transition-[width] duration-500" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
    </div>
  );
}

export default function SystemMonitor({ setTitle }) {
  const [cpu, setCpu] = useState(6);
  const [hist, setHist] = useState(() => Array(60).fill(6));
  const [mem, setMem] = useState(null);
  const [now, setNow] = useState(Date.now());
  const procs = usePids();
  const [tick, setTick] = useState(0);
  const canvasRef = useRef(null);
  const frameData = useRef({ last: performance.now(), samples: [] });

  useEffect(() => { setTitle?.('System Monitor'); }, [setTitle]);

  // measure frame timing -> rough CPU load of this tab
  useEffect(() => {
    let raf;
    const loop = (t) => {
      const d = t - frameData.current.last;
      frameData.current.last = t;
      if (d > 0 && d < 500) {
        frameData.current.samples.push(d);
        if (frameData.current.samples.length > 30) frameData.current.samples.shift();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const s = frameData.current.samples;
      const avg = s.length ? s.reduce((a, b) => a + b, 0) / s.length : 16.7;
      // 16.7ms frame = idle; higher = load. add some base jitter.
      const load = Math.max(2, Math.min(100, Math.round(((avg - 14) / 14) * 70 + 5 + Math.random() * 4)));
      setCpu(load);
      setHist((h) => [...h.slice(1), load]);
      try {
        const m = performance.memory;
        if (m) setMem({ used: m.usedJSHeapSize, total: m.jsHeapSizeLimit });
      } catch { /* not Chrome */ }
      setNow(Date.now());
      setTick((x) => x + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // draw CPU history sparkline
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const w = c.width = c.clientWidth * 2;
    const h = c.height = c.clientHeight * 2;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#2a2d37';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(0, (h / 4) * i); ctx.lineTo(w, (h / 4) * i); ctx.stroke(); }
    ctx.beginPath();
    hist.forEach((v, i) => {
      const x = (i / (hist.length - 1)) * w;
      const y = h - (v / 100) * h;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.strokeStyle = '#4fd16b';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.fillStyle = 'rgba(79,209,107,0.12)';
    ctx.fill();
  }, [hist]);

  const memPct = mem ? Math.round((mem.used / mem.total) * 100) : Math.round(28 + (cpu / 10));
  const memUsedGB = mem ? (mem.used / 1073741824).toFixed(2) : ((navigator.deviceMemory || 8) * 0.3).toFixed(2);
  const memTotGB = mem ? (mem.total / 1073741824).toFixed(1) : (navigator.deviceMemory || 8).toFixed(1);
  const up = Math.floor((now - BOOT) / 1000);
  const uptime = `${Math.floor(up / 3600)}h ${Math.floor(up / 60) % 60}m ${up % 60}s`;

  // live-ish per-process values
  const rows = procs
    .map((p) => {
      const base = p.self ? cpu / 4 : p.cpu;
      const jitter = (Math.sin((tick + p.pid) / 3) + 1) * (p.self ? 2 : 1.2);
      return { ...p, lcpu: Math.max(0, base + jitter).toFixed(1), lmem: p.mem.toFixed(1) };
    })
    .sort((a, b) => b.lcpu - a.lcpu);

  return (
    <div className="h-full flex flex-col bg-[#1f2129] text-[#dfe3ea] text-[13px]">
      <div className="flex gap-4 px-3 h-7 items-center text-[12.5px] text-[#c4c9d3] border-b border-[#2b2e38] select-none">
        {['Monitor', 'Edit', 'View', 'Help'].map((m) => <span key={m}>{m}</span>)}
      </div>

      {/* stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3">
        <Tile icon={Cpu} label="CPU" value={`${cpu}%`} color="#4fd16b"><Bar pct={cpu} color="#4fd16b" /></Tile>
        <Tile icon={MemoryStick} label="Memory" value={`${memPct}%`} color="#5aa2ff"><Bar pct={memPct} color="#5aa2ff" /></Tile>
        <Tile icon={Activity} label="Processes" value={procs.length + 48}><span className="text-[11px] text-[#7b8494]">{procs.length} shown, rest idle</span></Tile>
        <Tile icon={Clock} label="Uptime" value={uptime} small />
      </div>

      {/* cpu graph */}
      <div className="px-3 pb-2">
        <div className="text-[11.5px] text-[#8b93a3] mb-1">CPU history (this tab, last 60 s) &nbsp;·&nbsp; {memUsedGB} / {memTotGB} GB JS heap</div>
        <canvas ref={canvasRef} className="w-full h-16 rounded bg-[#14161d] border border-[#2b2e38]" />
      </div>

      {/* process table */}
      <div className="flex-1 overflow-y-auto kali-scroll border-t border-[#2b2e38]">
        <table className="w-full text-[12.5px]">
          <thead className="sticky top-0 bg-[#242730] text-[#8b93a3]">
            <tr className="text-left">
              <th className="px-3 py-1.5 font-medium">PID</th>
              <th className="px-2 py-1.5 font-medium">User</th>
              <th className="px-2 py-1.5 font-medium text-right">CPU%</th>
              <th className="px-2 py-1.5 font-medium text-right">MEM%</th>
              <th className="px-3 py-1.5 font-medium">Command</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.pid} className={`border-b border-[#23262e] ${p.self ? 'bg-[#1d2a44]/40' : 'hover:bg-white/5'}`}>
                <td className="px-3 py-1 tabular-nums text-[#9aa3b2]">{p.pid}</td>
                <td className="px-2 py-1 text-[#9aa3b2]">{p.user}</td>
                <td className={`px-2 py-1 text-right tabular-nums ${+p.lcpu > 10 ? 'text-[#e5c07b]' : ''}`}>{p.lcpu}</td>
                <td className="px-2 py-1 text-right tabular-nums">{p.lmem}</td>
                <td className="px-3 py-1 font-mono text-[#c4c9d3] truncate max-w-0">{p.cmd}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Tile({ icon: Icon, label, value, color, children, small }) {
  return (
    <div className="rounded-lg bg-[#14161d] border border-[#2b2e38] p-3">
      <div className="flex items-center gap-1.5 text-[11.5px] text-[#8b93a3] mb-1"><Icon size={13} style={{ color }} /> {label}</div>
      <div className={`font-semibold tabular-nums ${small ? 'text-[15px]' : 'text-[20px]'}`}>{value}</div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
