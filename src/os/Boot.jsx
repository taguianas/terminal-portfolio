import { useState, useEffect, useRef } from 'react';
import { Power, Wifi, Volume2, BatteryFull, User, Accessibility } from 'lucide-react';
import { CONFIG } from '../config';
import { Logo } from '../components/Icons';
import { wallpaperStyle } from './wallpaper';

// ----------------------------- GRUB --------------------------------
const GRUB_ENTRIES = [
  `${CONFIG.osName.replace(' Rolling', '')}`,
  `Advanced options for ${CONFIG.osName.replace(' Rolling', '')}`,
  'Memory test (memtest86+x64.efi)',
  'UEFI Firmware Settings',
];

export function Grub({ onDone }) {
  const [sel, setSel] = useState(0);
  const [left, setLeft] = useState(3);
  const [touched, setTouched] = useState(false);
  const done = useRef(false);
  const finish = () => { if (!done.current) { done.current = true; onDone(); } };

  useEffect(() => {
    if (touched) return;
    if (left <= 0) { finish(); return; }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  });

  useEffect(() => {
    const onKey = (e) => {
      setTouched(true);
      if (e.key === 'ArrowDown') setSel((s) => Math.min(GRUB_ENTRIES.length - 1, s + 1));
      else if (e.key === 'ArrowUp') setSel((s) => Math.max(0, s - 1));
      else if (e.key === 'Enter') finish();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="fixed inset-0 bg-black text-[#c7c7c7] font-mono text-[13px] sm:text-[15px] flex flex-col items-center justify-center p-4 select-none" onClick={finish}>
      <div className="mb-6 text-center">GNU GRUB  version 2.12-9</div>
      <div className="w-full max-w-3xl border border-[#c7c7c7] p-1 min-h-[260px]">
        {GRUB_ENTRIES.map((e, i) => (
          <div key={e} className={`px-2 ${i === sel ? 'bg-[#c7c7c7] text-black' : ''}`}>
            {i === sel ? '*' : ' '}{e}
          </div>
        ))}
      </div>
      <div className="w-full max-w-3xl mt-4 px-2 leading-relaxed text-[12px] sm:text-[14px]">
        <div>Use the ▲ and ▼ keys to select which entry is highlighted.</div>
        <div>Press enter to boot the selected OS, `e' to edit the commands before booting or `c' for a command-line.</div>
        {!touched && <div className="mt-1">The highlighted entry will be executed automatically in {left}s.</div>}
      </div>
    </div>
  );
}

// --------------------------- kernel / systemd ----------------------
const LOGS = [
  ['', 'Loading Linux 6.12.38+kali-amd64 ...'],
  ['', 'Loading initial ramdisk ...'],
  ['ok', 'Started systemd-journald.service - Journal Service.'],
  ['ok', 'Finished systemd-udev-trigger.service - Coldplug All udev Devices.'],
  ['ok', 'Reached target local-fs.target - Local File Systems.'],
  ['ok', `Mounted home-${CONFIG.user}-portfolio.mount - /home/${CONFIG.user}/portfolio.`],
  ['ok', 'Started NetworkManager.service - Network Manager.'],
  ['ok', 'Reached target network-online.target - Network is Online.'],
  ['ok', 'Started ssh.service - OpenBSD Secure Shell server.'],
  ['ok', 'Started postgresql.service - PostgreSQL RDBMS.'],
  ['ok', 'Started cron.service - Regular background program processing daemon.'],
  ['ok', 'Started lightdm.service - Light Display Manager.'],
  ['ok', 'Reached target graphical.target - Graphical Interface.'],
];

export function BootLogs({ onDone, fast = false }) {
  const [n, setN] = useState(0);
  const done = useRef(false);
  const finish = () => { if (!done.current) { done.current = true; onDone(); } };

  useEffect(() => {
    if (n >= LOGS.length) {
      const t = setTimeout(finish, 450);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setN((x) => x + 1), (fast ? 60 : 120) + Math.random() * (fast ? 60 : 160));
    return () => clearTimeout(t);
  });

  useEffect(() => {
    window.addEventListener('keydown', finish);
    return () => window.removeEventListener('keydown', finish);
  });

  return (
    <div className="fixed inset-0 bg-black text-[#bcbcbc] font-mono text-[12px] sm:text-[14px] p-3 sm:p-5 overflow-hidden select-none" onClick={finish}>
      {LOGS.slice(0, n).map(([k, l], i) => (
        <div key={i} className="whitespace-pre-wrap">
          {k === 'ok' ? (
            <>
              [<span className="text-[#4fd16b] font-bold">  OK  </span>] {l}
            </>
          ) : l}
        </div>
      ))}
      <span className="inline-block w-2.5 h-4 bg-[#bcbcbc] animate-pulse align-middle" />
      <div className="absolute bottom-3 right-4 text-[11px] text-[#555]">click or press any key to skip</div>
    </div>
  );
}

// ------------------------------ LightDM ----------------------------
export function Login({ onLogin, locked = false }) {
  const [user, setUser] = useState(locked ? CONFIG.user : '');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [auto, setAuto] = useState(true);
  const [now, setNow] = useState(new Date());
  const passRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);

  const submit = (e) => {
    e?.preventDefault();
    if (busy) return;
    setBusy(true);
    setTimeout(onLogin, 550);
  };

  // auto-type "visitor" / password, then log in
  useEffect(() => {
    if (!auto) return;
    const target = CONFIG.user;
    let t;
    if (user.length < target.length) t = setTimeout(() => setUser(target.slice(0, user.length + 1)), user.length === 0 ? 700 : 90);
    else if (pass.length < 8) t = setTimeout(() => setPass('x'.repeat(pass.length + 1)), pass.length === 0 ? 350 : 80);
    else t = setTimeout(submit, 450);
    return () => clearTimeout(t);
  });

  const stopAuto = () => setAuto(false);

  return (
    <div className="fixed inset-0 font-ui text-[#e8eaee] select-none" style={wallpaperStyle}>
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[6px]" />
      <div className="absolute top-0 inset-x-0 h-8 flex items-center px-3 text-[13px] bg-black/40">
        <span className="font-semibold">{CONFIG.host}</span>
        <span className="absolute left-1/2 -translate-x-1/2 font-semibold tabular-nums">
          {now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}, {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <div className="ml-auto flex items-center gap-3 text-[#c4c9d3]">
          <Accessibility size={15} /><Wifi size={15} /><Volume2 size={15} /><BatteryFull size={17} /><Power size={15} />
        </div>
      </div>

      <form onSubmit={submit} className="relative h-full flex flex-col items-center justify-center gap-6 px-6 -mt-6">
        <Logo size={110} className="drop-shadow-[0_6px_24px_rgba(54,123,240,0.45)]" />
        <div className="w-full max-w-[320px] space-y-3">
          <div className="flex items-center gap-2 h-10 px-3 rounded bg-[#14161d]/85 border border-[#3a3f4d] focus-within:border-[#367bf0]">
            <User size={16} className="text-[#8b93a3]" />
            <input
              value={user}
              onChange={(e) => { stopAuto(); setUser(e.target.value); }}
              onFocus={stopAuto}
              placeholder="Username"
              className="flex-1 bg-transparent outline-none placeholder:text-[#6b7383]"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="flex items-center gap-2 h-10 px-3 rounded bg-[#14161d]/85 border border-[#3a3f4d] focus-within:border-[#367bf0]">
            <span className="text-[#8b93a3] text-[15px] w-4 text-center">*</span>
            <input
              ref={passRef}
              type="password"
              value={pass}
              onChange={(e) => { stopAuto(); setPass(e.target.value); }}
              onFocus={stopAuto}
              placeholder="Password"
              className="flex-1 bg-transparent outline-none placeholder:text-[#6b7383]"
            />
          </div>
          <button type="submit" className="w-full h-10 rounded bg-[#367bf0] hover:bg-[#4a8bff] font-semibold text-white transition-colors">
            {busy ? 'Logging in...' : 'Log In'}
          </button>
        </div>
        <div className="text-[12px] text-[#aeb4c0] text-center">
          {locked ? 'Session locked.' : 'Guest access enabled.'} Any password works, just press <b>Log In</b>.
        </div>
      </form>
      {busy && <div className="absolute inset-0 bg-black animate-[fadeIn_.5s_ease_forwards]" />}
    </div>
  );
}

// ------------------------------ shutdown ---------------------------
export function PoweredOff({ onPowerOn }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setPhase(1), 1600);
    return () => clearTimeout(t);
  }, []);
  if (phase === 0) {
    return (
      <div className="fixed inset-0 bg-black text-[#bcbcbc] font-mono text-[13px] p-5">
        <div>[<span className="text-[#4fd16b] font-bold">  OK  </span>] Stopped lightdm.service - Light Display Manager.</div>
        <div>[<span className="text-[#4fd16b] font-bold">  OK  </span>] Unmounted /home/{CONFIG.user}/portfolio.</div>
        <div>[<span className="text-[#4fd16b] font-bold">  OK  </span>] Reached target shutdown.target - System Shutdown.</div>
        <div className="mt-2">reboot: Power down</div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4">
      <button onClick={onPowerOn} className="w-20 h-20 rounded-full border-2 border-[#333] text-[#555] hover:text-[#367bf0] hover:border-[#367bf0] flex items-center justify-center transition-colors" aria-label="Power on">
        <Power size={34} />
      </button>
      <div className="text-[#444] text-xs font-mono">press to power on</div>
    </div>
  );
}

// ---------------------------- kernel panic -------------------------
export function KernelPanic() {
  const hex = () => Math.random().toString(16).slice(2, 18).padEnd(16, '0');
  const [rows] = useState(() => Array.from({ length: 22 }, () => `[<ffffffff${hex().slice(0, 8)}>] ? 0x${hex()} 0x${hex()}`));
  return (
    <div className="fixed inset-0 bg-black text-[#d0d0d0] font-mono text-[12px] sm:text-[13px] p-4 overflow-hidden select-none z-[200000]">
      <div>[  13.370000] rm -rf / : removing /bin, /boot, /etc, /home ...</div>
      <div>[  13.371337] Kernel panic - not syncing: Attempted to kill init! exitcode=0x00000100</div>
      <div>[  13.371338] CPU: 0 PID: 1 Comm: systemd Tainted: G   D  6.12.38+kali-amd64 #1</div>
      <div>[  13.371339] Call Trace:</div>
      {rows.map((r, i) => <div key={i} className="opacity-70">[  13.3714{String(i).padStart(2, '0')}]  {r}</div>)}
      <div className="mt-2 text-[#ff6b6b] font-bold">---[ end Kernel panic - not syncing: you deleted everything. Rebooting in 5 seconds... ]---</div>
    </div>
  );
}

// ------------------------------- matrix ----------------------------
export function Matrix({ onExit }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c.getContext('2d');
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    const chars = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリギジヂビピウゥクスツヌフムユルグズブヅプエケセテネヘメレゲゼデベペオォコソトノホモヨロゴゾドボポ0123456789ABCDEF';
    const size = 16;
    let drops = Array(Math.floor(c.width / size)).fill(1);
    const id = setInterval(() => {
      if (drops.length !== Math.floor(c.width / size)) drops = Array(Math.floor(c.width / size)).fill(1);
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.fillStyle = '#3bff6b';
      ctx.font = `${size}px monospace`;
      drops.forEach((y, i) => {
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * size, y * size);
        drops[i] = y * size > c.height && Math.random() > 0.975 ? 0 : y + 1;
      });
    }, 33);
    const key = () => onExit();
    window.addEventListener('keydown', key);
    window.addEventListener('resize', resize);
    return () => { clearInterval(id); window.removeEventListener('keydown', key); window.removeEventListener('resize', resize); };
  }, [onExit]);
  return (
    <div className="fixed inset-0 z-[200000] cursor-pointer bg-black" onClick={onExit}>
      <canvas ref={ref} className="block w-full h-full" />
      <div className="absolute top-4 right-4 text-[#3bff6b] font-mono text-sm bg-black/70 px-3 py-1.5 rounded">Wake up, {CONFIG.user}... (press any key)</div>
    </div>
  );
}
