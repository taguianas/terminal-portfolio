import { useState, useEffect, useRef } from 'react';
import {
  Bell, BellOff, Volume, Volume1, Volume2, VolumeX, Wifi, WifiOff, Cable,
  Battery, BatteryLow, BatteryMedium, BatteryFull, BatteryCharging, PlugZap,
  ChevronLeft, ChevronRight, Trash2, Globe, Gauge, Activity,
} from 'lucide-react';
import { getVolume, setVolume, onVolume, play } from './sound';
import { CONFIG } from '../config';

// ------------------------------------------------------------------
// Live data hooks (all read from the visitor's real browser/device)
// ------------------------------------------------------------------
function useNow(ms = 1000) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

function useVolume() {
  const [v, setV] = useState(getVolume());
  useEffect(() => onVolume(setV), []);
  return v;
}

function useNetwork() {
  const read = () => {
    const c = navigator.connection || {};
    return {
      online: navigator.onLine,
      type: c.type || null,
      effectiveType: c.effectiveType || null,
      downlink: c.downlink ?? null,
      rtt: c.rtt ?? null,
      saveData: !!c.saveData,
    };
  };
  const [net, setNet] = useState(read);
  useEffect(() => {
    const up = () => setNet(read());
    window.addEventListener('online', up);
    window.addEventListener('offline', up);
    navigator.connection?.addEventListener?.('change', up);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', up);
      navigator.connection?.removeEventListener?.('change', up);
    };
  }, []);
  return net;
}

function useBattery() {
  const [bat, setBat] = useState(null); // null = API not supported
  useEffect(() => {
    let b = null;
    let alive = true;
    const up = () => alive && b && setBat({
      level: b.level,
      charging: b.charging,
      chargingTime: b.chargingTime,
      dischargingTime: b.dischargingTime,
    });
    navigator.getBattery?.().then((x) => {
      b = x;
      up();
      ['levelchange', 'chargingchange', 'chargingtimechange', 'dischargingtimechange'].forEach((e) => b.addEventListener(e, up));
    }).catch(() => {});
    return () => {
      alive = false;
      if (b) ['levelchange', 'chargingchange', 'chargingtimechange', 'dischargingtimechange'].forEach((e) => b.removeEventListener(e, up));
    };
  }, []);
  return bat;
}

const fmtDuration = (s) => {
  if (!Number.isFinite(s) || s <= 0) return null;
  const h = Math.floor(s / 3600);
  const m = Math.round((s % 3600) / 60);
  return h ? `${h} h ${m} min` : `${m} min`;
};

// ------------------------------------------------------------------
export default function Tray({ notifications, onClearNotifications, dnd, setDnd, unread, onOpenNotifications }) {
  const [open, setOpen] = useState(null); // 'notif' | 'volume' | 'net' | 'battery' | 'clock'
  const ref = useRef(null);
  const vol = useVolume();
  const net = useNetwork();
  const bat = useBattery();
  const now = useNow(1000);

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(null); };
    const esc = (e) => e.key === 'Escape' && setOpen(null);
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', esc);
    return () => { window.removeEventListener('pointerdown', close); window.removeEventListener('keydown', esc); };
  }, [open]);

  const toggle = (k) => {
    setOpen((o) => (o === k ? null : k));
    if (k === 'notif') onOpenNotifications();
  };

  const VolIcon = vol.muted || vol.level === 0 ? VolumeX : vol.level < 34 ? Volume : vol.level < 67 ? Volume1 : Volume2;
  const NetIcon = !net.online ? WifiOff : net.type === 'ethernet' ? Cable : Wifi;
  const hasBattery = bat && !(bat.charging && bat.level === 1 && bat.chargingTime === 0 && bat.dischargingTime === Infinity);
  const BatIcon = !bat ? PlugZap : bat.charging ? BatteryCharging : bat.level < 0.2 ? BatteryLow : bat.level < 0.6 ? BatteryMedium : bat.level < 0.95 ? Battery : BatteryFull;

  const day = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div ref={ref} className="relative h-full flex items-center">
      <div className="flex items-center h-full text-[#c4c9d3]">
        <TrayBtn on={open === 'notif'} onClick={() => toggle('notif')} title="Notifications" className="hidden sm:flex relative">
          {dnd ? <BellOff size={14} /> : <Bell size={14} />}
          {unread > 0 && !dnd && <span className="absolute top-1.5 right-1 w-2 h-2 rounded-full bg-[#e5484d]" />}
        </TrayBtn>
        <TrayBtn on={open === 'volume'} onClick={() => toggle('volume')} title={`Volume ${vol.muted ? 'muted' : vol.level + '%'}`} className="hidden sm:flex"
          onWheel={(e) => setVolume({ level: Math.max(0, Math.min(100, vol.level + (e.deltaY < 0 ? 5 : -5))), muted: false })}>
          <VolIcon size={15} />
        </TrayBtn>
        <TrayBtn on={open === 'net'} onClick={() => toggle('net')} title={net.online ? 'Connected' : 'Offline'}>
          <NetIcon size={15} className={net.online ? '' : 'text-[#ff6b6b]'} />
        </TrayBtn>
        <TrayBtn on={open === 'battery'} onClick={() => toggle('battery')} title={bat ? `${Math.round(bat.level * 100)}%${bat.charging ? ' (charging)' : ''}` : 'Power'} className="hidden sm:flex gap-1">
          <BatIcon size={17} />
          {hasBattery && <span className="text-[11px] tabular-nums">{Math.round(bat.level * 100)}%</span>}
        </TrayBtn>
      </div>
      <button onClick={() => toggle('clock')} className={`h-full px-2 text-[12.5px] font-semibold tabular-nums whitespace-nowrap ${open === 'clock' ? 'bg-white/10' : 'hover:bg-white/10'}`} title={now.toDateString()}>
        <span className="hidden lg:inline text-[#aeb4c0] font-normal mr-2">{day}</span>
        {time}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-[320px] max-w-[calc(100vw-8px)] rounded-md bg-[#22242c] border border-[#363a46] shadow-2xl text-[13px] text-[#dfe3ea] wm-open" style={{ zIndex: 100003 }}>
          {open === 'notif' && <NotificationsPanel items={notifications} onClear={onClearNotifications} dnd={dnd} setDnd={setDnd} />}
          {open === 'volume' && <VolumePanel vol={vol} />}
          {open === 'net' && <NetworkPanel net={net} />}
          {open === 'battery' && <BatteryPanel bat={bat} hasBattery={hasBattery} />}
          {open === 'clock' && <CalendarPanel now={now} />}
        </div>
      )}
    </div>
  );
}

function TrayBtn({ children, on, className = '', ...rest }) {
  return (
    <button className={`h-full px-1.5 flex items-center ${on ? 'bg-white/10' : 'hover:bg-white/10'} ${className}`} {...rest}>
      {children}
    </button>
  );
}

function Header({ children, right }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-[#2f3340] font-semibold">
      <span>{children}</span>
      {right}
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-3 px-3 py-1">
      <span className="text-[#8b93a3]">{k}</span>
      <span className="text-right">{v}</span>
    </div>
  );
}

function Switch({ on, onChange, label }) {
  return (
    <button onClick={() => onChange(!on)} className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5">
      <span>{label}</span>
      <span className={`w-9 h-5 rounded-full relative transition-colors ${on ? 'bg-[#367bf0]' : 'bg-[#3a3f4d]'}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${on ? 'left-[18px]' : 'left-0.5'}`} />
      </span>
    </button>
  );
}

// ------------------------------- notifications --------------------
function NotificationsPanel({ items, onClear, dnd, setDnd }) {
  return (
    <div>
      <Header right={items.length > 0 && <button onClick={onClear} className="text-[12px] font-normal text-[#8b93a3] hover:text-white flex items-center gap-1"><Trash2 size={12} /> Clear all</button>}>
        Notifications
      </Header>
      <div className="max-h-[320px] overflow-y-auto kali-scroll">
        {items.length === 0 && <div className="px-3 py-6 text-center text-[#7b8494]">No notifications</div>}
        {[...items].reverse().map((n) => (
          <div key={n.id} className="px-3 py-2 border-b border-[#2b2e38] last:border-0">
            <div className="flex justify-between gap-2">
              <span className="font-semibold">{n.title}</span>
              <span className="text-[11px] text-[#7b8494] shrink-0">{n.time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {n.body && <div className="text-[12.5px] text-[#aeb4c0] mt-0.5">{n.body}</div>}
          </div>
        ))}
      </div>
      <div className="border-t border-[#2f3340]"><Switch on={dnd} onChange={setDnd} label="Do not disturb" /></div>
    </div>
  );
}

// ---------------------------------- volume ------------------------
function VolumePanel({ vol }) {
  return (
    <div>
      <Header right={<span className="font-normal text-[#8b93a3] tabular-nums">{vol.muted ? 'muted' : `${vol.level}%`}</span>}>Audio</Header>
      <div className="px-3 py-3 flex items-center gap-3">
        <button onClick={() => setVolume({ muted: !vol.muted })} className="p-1 rounded hover:bg-white/10" title={vol.muted ? 'Unmute' : 'Mute'}>
          {vol.muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <input
          type="range" min={0} max={100} value={vol.muted ? 0 : vol.level}
          onChange={(e) => setVolume({ level: +e.target.value, muted: false })}
          onPointerUp={() => play('click')}
          className="flex-1 accent-[#367bf0]"
          aria-label="Volume"
        />
      </div>
      <Row k="Output" v="Browser audio (Web Audio API)" />
      <div className="px-3 pt-1 pb-3">
        <button onClick={() => play('test')} className="w-full py-1.5 rounded bg-[#2f3340] hover:bg-[#3a3f4d]">Play test sound</button>
      </div>
      <div className="px-3 pb-3 text-[11.5px] text-[#7b8494]">Controls the desktop sounds (login, notifications). Scroll on the icon to change it.</div>
    </div>
  );
}

// --------------------------------- network ------------------------
function NetworkPanel({ net }) {
  const [ping, setPing] = useState(null);
  const [ip, setIp] = useState(null);
  const [busy, setBusy] = useState(false);

  const test = async () => {
    setBusy(true);
    const times = [];
    for (let i = 0; i < 3; i++) {
      const t0 = performance.now();
      try {
        await fetch(`${CONFIG.kaliImage.replace(/[^/]+$/, '')}version.txt?ping=${Date.now()}${i}`, { cache: 'no-store' });
        times.push(performance.now() - t0);
      } catch { /* offline */ }
    }
    setPing(times.length ? `${Math.round(Math.min(...times))} ms` : 'unreachable');
    setBusy(false);
  };

  const showIp = async () => {
    setIp('...');
    try {
      const r = await fetch('https://api.ipify.org?format=json', { cache: 'no-store' });
      setIp((await r.json()).ip);
    } catch { setIp('unavailable'); }
  };

  const label = net.type === 'ethernet' ? 'Wired connection 1' : net.type === 'wifi' ? 'Wi-Fi' : net.type === 'cellular' ? 'Mobile broadband' : 'Network connection';

  return (
    <div>
      <Header right={<span className={`font-normal ${net.online ? 'text-[#4fd16b]' : 'text-[#ff6b6b]'}`}>{net.online ? 'Connected' : 'Disconnected'}</span>}>
        {label}
      </Header>
      <div className="py-1">
        <Row k="Status" v={net.online ? 'Online' : 'Offline'} />
        {net.effectiveType && <Row k="Quality" v={net.effectiveType.toUpperCase()} />}
        {net.downlink != null && <Row k="Bandwidth (est.)" v={`${net.downlink} Mbit/s`} />}
        {net.rtt != null && <Row k="Round trip (est.)" v={`${net.rtt} ms`} />}
        {net.saveData && <Row k="Data saver" v="On" />}
        <Row k="Latency to GitHub" v={ping || '-'} />
        <Row k="Public IP" v={ip || '-'} />
        <Row k="VM interface" v="eth0 10.0.2.15" />
      </div>
      <div className="flex gap-2 px-3 pb-3 pt-1">
        <button onClick={test} disabled={busy || !net.online} className="flex-1 py-1.5 rounded bg-[#2f3340] hover:bg-[#3a3f4d] disabled:opacity-40 flex items-center justify-center gap-1.5">
          <Gauge size={13} /> {busy ? 'Testing...' : 'Test latency'}
        </button>
        <button onClick={showIp} disabled={!net.online} className="flex-1 py-1.5 rounded bg-[#2f3340] hover:bg-[#3a3f4d] disabled:opacity-40 flex items-center justify-center gap-1.5">
          <Globe size={13} /> Show my IP
        </button>
      </div>
      {!navigator.connection && <div className="px-3 pb-3 text-[11.5px] text-[#7b8494]">This browser does not share connection quality details.</div>}
    </div>
  );
}

// --------------------------------- battery ------------------------
function BatteryPanel({ bat, hasBattery }) {
  if (!bat) {
    return (
      <div>
        <Header>Power</Header>
        <div className="px-3 py-3 text-[#aeb4c0]">This browser does not expose the battery status (Firefox and Safari hide it). Assuming AC power.</div>
      </div>
    );
  }
  const pct = Math.round(bat.level * 100);
  return (
    <div>
      <Header right={<span className="font-normal tabular-nums">{pct}%</span>}>{hasBattery ? 'Battery' : 'AC adapter'}</Header>
      <div className="px-3 py-3">
        <div className="h-3 rounded bg-[#14161d] border border-[#3a3f4d] overflow-hidden">
          <div className={`h-full transition-all ${pct < 20 ? 'bg-[#e5484d]' : pct < 50 ? 'bg-[#e5c07b]' : 'bg-[#4fd16b]'}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <Row k="State" v={!hasBattery ? 'Plugged in, no battery' : bat.charging ? (pct === 100 ? 'Fully charged' : 'Charging') : 'On battery'} />
      {hasBattery && bat.charging && fmtDuration(bat.chargingTime) && <Row k="Full in" v={fmtDuration(bat.chargingTime)} />}
      {hasBattery && !bat.charging && fmtDuration(bat.dischargingTime) && <Row k="Time left" v={fmtDuration(bat.dischargingTime)} />}
      <div className="px-3 pt-2 pb-3 text-[11.5px] text-[#7b8494] flex items-center gap-1.5"><Activity size={12} /> Live from your device's Battery Status API.</div>
    </div>
  );
}

// -------------------------------- calendar ------------------------
function CalendarPanel({ now }) {
  const [offset, setOffset] = useState(0);
  const base = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const startDay = (base.getDay() + 6) % 7; // Monday first
  const days = new Date(base.getFullYear(), base.getMonth() + 1, 0).getDate();
  const cells = [...Array(startDay).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const isToday = (d) => d && offset === 0 && d === now.getDate();
  return (
    <div className="p-3">
      <div className="text-center mb-2">
        <div className="text-2xl font-light tabular-nums">{now.toLocaleTimeString('en-GB')}</div>
        <div className="text-[#aeb4c0]">{now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
        <div className="text-[11.5px] text-[#7b8494]">{Intl.DateTimeFormat().resolvedOptions().timeZone}</div>
      </div>
      <div className="flex items-center justify-between mb-1">
        <button onClick={() => setOffset((o) => o - 1)} className="p-1 rounded hover:bg-white/10"><ChevronLeft size={16} /></button>
        <button onClick={() => setOffset(0)} className="font-semibold hover:underline">{base.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</button>
        <button onClick={() => setOffset((o) => o + 1)} className="p-1 rounded hover:bg-white/10"><ChevronRight size={16} /></button>
      </div>
      <div className="grid grid-cols-7 text-center text-[12px] gap-y-0.5">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => <div key={d} className="text-[#7b8494] py-1">{d}</div>)}
        {cells.map((d, i) => (
          <div key={i} className={`py-1 rounded ${isToday(d) ? 'bg-[#367bf0] text-white font-bold' : d ? 'hover:bg-white/5' : ''}`}>{d || ''}</div>
        ))}
      </div>
    </div>
  );
}
