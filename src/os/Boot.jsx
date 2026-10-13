import { useState, useEffect, useRef } from 'react';
import { Power, Accessibility, Briefcase } from 'lucide-react';
import { CONFIG } from '../config';
import { Logo } from '../components/Icons';
import { useWallpaperStyle } from './wallpaper';

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

const VERBOSE = [
  ['', '[    0.000000] Linux version 6.12.38+kali-amd64 (devel@kali.org) (gcc-14 (Debian 14.2.0-19) 14.2.0) #1 SMP PREEMPT_DYNAMIC Kali 6.12.38-1kali1'],
  ['', '[    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz-6.12.38+kali-amd64 root=UUID=3f6c1a2e-8d4b-4c71-9b2e-a7d5c0e41f93 ro'],
  ['', `[    0.000000] DMI: Portfolio Megatrends Browser VM/${navigator.hardwareConcurrency || 4} cores, BIOS 2.22.1287 10/13/2026`],
  ['', '[    0.012034] smpboot: Allowing CPUs, 0 hotplug CPUs'],
  ['', '[    0.204551] ACPI: Core revision 20240827'],
  ['', `[    0.312876] Memory: ${navigator.deviceMemory ? navigator.deviceMemory * 1024 * 1024 : 8388608}K available`],
  ['', '[    1.004211] EXT4-fs (sda2): mounted filesystem 3f6c1a2e-8d4b-4c71-9b2e-a7d5c0e41f93 ro with ordered data mode'],
  ['', '[    1.553120] systemd[1]: systemd 257.7-1 running in system mode (+PAM +AUDIT +SELINUX +APPARMOR +IMA +SMACK +SECCOMP)'],
  ['', '[    1.553901] systemd[1]: Detected architecture x86-64.'],
  ['', `[    1.560018] systemd[1]: Hostname set to <${CONFIG.host}>.`],
];

export function BootLogs({ onDone, fast = false, verbose = false, recovery = false }) {
  const [n, setN] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const done = useRef(false);
  const lines = verbose || recovery ? [...LOGS.slice(0, 2), ...VERBOSE, ...LOGS.slice(2)] : LOGS;
  const finish = () => {
    if (done.current) return;
    if (recovery && !waiting) { setN(lines.length); setWaiting(true); return; }
    done.current = true;
    onDone();
  };

  useEffect(() => {
    if (waiting) return;
    if (n >= lines.length) {
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
      {lines.slice(0, n).map(([k, l], i) => (
        <div key={i} className="whitespace-pre-wrap">
          {k === 'ok' ? (
            <>
              [<span className="text-[#4fd16b] font-bold">  OK  </span>] {l}
            </>
          ) : l}
        </div>
      ))}
      {waiting && (
        <div className="mt-2">
          <div>You are in emergency mode. After logging in, type "journalctl -xb" to view</div>
          <div>system logs, "systemctl reboot" to reboot, or "exit" to continue bootup.</div>
          <div className="mt-1">Give root password for maintenance</div>
          <div>(or press Control-D to continue): <span className="text-white">press any key or click to continue</span></div>
        </div>
      )}
      <span className="inline-block w-2.5 h-4 bg-[#bcbcbc] animate-pulse align-middle" />
      {!waiting && <div className="absolute bottom-3 right-4 text-[11px] text-[#555]">click or press any key to skip</div>}
    </div>
  );
}

// ------------------------------ LightDM ----------------------------
// Kali's lightdm-gtk-greeter: top indicator bar (host, clock, session,
// accessibility, power) and a centered login box under the logo.
function XfceIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 7c2-2 5-1 6 1l1 2c1-1 3-2 5-1l2-3 1 1-2 3c1 1 1 3 0 4l1 4h-2l-1-3c-1 1-3 1-4 0l-2 3H7l2-4C6 13 3 11 4 7z" />
    </svg>
  );
}

export function Login({ onLogin, onPower, onRecruiter, locked = false }) {
  const wallpaperStyle = useWallpaperStyle();
  const [user, setUser] = useState(locked ? CONFIG.user : '');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [auto, setAuto] = useState(true);
  const [menu, setMenu] = useState(null); // session | a11y | power
  const [session, setSession] = useState('Xfce Session');
  const [largeText, setLargeText] = useState(() => document.body.style.zoom === '1.15');
  const [contrast, setContrast] = useState(() => document.documentElement.style.filter.includes('contrast'));
  const [suspended, setSuspended] = useState(false);
  const [now, setNow] = useState(new Date());
  const btnRef = useRef(null);
  const barRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { document.body.style.zoom = largeText ? '1.15' : ''; }, [largeText]);
  useEffect(() => { document.documentElement.style.filter = contrast ? 'contrast(1.35) saturate(1.2)' : ''; }, [contrast]);

  const submit = (e) => {
    e?.preventDefault();
    if (busy || suspended) return;
    setBusy(true);
    setTimeout(onLogin, 550);
  };

  // auto-type the guest credentials, then wait for the visitor
  const filled = user.length >= CONFIG.user.length && pass.length >= 8;
  useEffect(() => {
    if (!auto) return;
    const target = CONFIG.user;
    let t;
    if (user.length < target.length) t = setTimeout(() => setUser(target.slice(0, user.length + 1)), user.length === 0 ? 700 : 90);
    else if (pass.length < 8) t = setTimeout(() => setPass('x'.repeat(pass.length + 1)), pass.length === 0 ? 350 : 80);
    else setAuto(false);
    return () => clearTimeout(t);
  });
  const stopAuto = () => setAuto(false);

  useEffect(() => {
    if (filled && !auto) btnRef.current?.focus({ preventScroll: true });
  }, [filled, auto]);

  // Enter logs in from anywhere; Escape closes menus; any key wakes from suspend
  useEffect(() => {
    const onKey = (e) => {
      if (suspended) { setSuspended(false); return; }
      if (e.key === 'Escape') setMenu(null);
      if (e.key !== 'Enter' || e.target.closest?.('form')) return;
      e.preventDefault();
      submit();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if (!menu) return;
    const close = (e) => { if (!barRef.current?.contains(e.target)) setMenu(null); };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [menu]);

  const power = (a) => {
    setMenu(null);
    if (a === 'suspend') setSuspended(true);
    else onPower?.(a);
  };

  const time = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) + ', ' + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 font-ui text-[#e8eaee] select-none" style={wallpaperStyle}>
      {/* indicator bar */}
      <div ref={barRef} className="absolute top-0 inset-x-0 h-[26px] flex items-center text-[13px] bg-black/60 z-10">
        <span className="px-3 font-semibold">{CONFIG.host}</span>
        <span className="absolute left-1/2 -translate-x-1/2 font-semibold tabular-nums">{time}</span>
        <div className="ml-auto flex items-center h-full">
          <BarBtn on={menu === 'session'} onClick={() => setMenu(menu === 'session' ? null : 'session')} title="Session"><XfceIcon /></BarBtn>
          <BarBtn on={menu === 'a11y'} onClick={() => setMenu(menu === 'a11y' ? null : 'a11y')} title="Accessibility"><Accessibility size={15} /></BarBtn>
          <BarBtn on={menu === 'power'} onClick={() => setMenu(menu === 'power' ? null : 'power')} title="Power"><Power size={15} /></BarBtn>
        </div>
        {menu && (
          <div className="absolute right-1 top-full mt-0.5 min-w-[200px] py-1 rounded bg-[#1f2129] border border-[#363a46] shadow-2xl text-[13px]">
            {menu === 'session' && ['Xfce Session', 'Default Xsession'].map((s) => (
              <MenuItem key={s} onClick={() => { setSession(s); setMenu(null); }}>
                <span className="w-4 inline-block">{session === s ? '●' : ''}</span>{s}
              </MenuItem>
            ))}
            {menu === 'a11y' && (
              <>
                <MenuItem onClick={() => setLargeText((v) => !v)}><span className="w-4 inline-block">{largeText ? '✓' : ''}</span>Large Font</MenuItem>
                <MenuItem onClick={() => setContrast((v) => !v)}><span className="w-4 inline-block">{contrast ? '✓' : ''}</span>High Contrast</MenuItem>
              </>
            )}
            {menu === 'power' && (
              <>
                <MenuItem onClick={() => power('suspend')}>Suspend</MenuItem>
                <MenuItem onClick={() => power('reboot')}>Restart...</MenuItem>
                <MenuItem onClick={() => power('shutdown')}>Shut Down...</MenuItem>
              </>
            )}
          </div>
        )}
      </div>

      {/* login box */}
      <form onSubmit={submit} className="relative h-full flex flex-col items-center justify-center px-6">
        <Logo size={132} className="mb-7 drop-shadow-[0_8px_28px_rgba(0,0,0,0.6)]" />
        <div className="w-full max-w-[340px] rounded-md bg-[#16181e]/80 backdrop-blur-md border border-white/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.55)] p-5 space-y-3">
          <input
            value={user}
            onChange={(e) => { stopAuto(); setUser(e.target.value); }}
            onFocus={stopAuto}
            placeholder="Username"
            className="w-full h-9 px-3 rounded bg-[#0e1014] border border-[#2c303a] focus:border-[#367bf0] outline-none text-[14px] placeholder:text-[#6b7383]"
            autoComplete="off"
            spellCheck={false}
          />
          <input
            type="password"
            value={pass}
            onChange={(e) => { stopAuto(); setPass(e.target.value); }}
            onFocus={stopAuto}
            placeholder="Password"
            className="w-full h-9 px-3 rounded bg-[#0e1014] border border-[#2c303a] focus:border-[#367bf0] outline-none text-[14px] tracking-wider placeholder:tracking-normal placeholder:text-[#6b7383]"
          />
          <div className="flex items-center justify-between pt-1">
            <span className="flex items-center gap-1.5 text-[12px] text-[#8b93a3]"><XfceIcon size={13} />{session}</span>
            <button
              ref={btnRef}
              type="submit"
              className={`h-8 px-5 rounded bg-[#367bf0] hover:bg-[#4a8bff] text-white text-[13.5px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[#9cc2ff] ${filled && !busy ? 'ring-2 ring-[#9cc2ff]/70' : ''}`}
            >
              {busy ? 'Logging in…' : 'Log In'}
            </button>
          </div>
        </div>
      </form>

      {onRecruiter && !locked && (
        <button type="button" onClick={onRecruiter} className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[13px] text-white backdrop-blur">
          <Briefcase size={14} /> Recruiter? Open the one-page profile
        </button>
      )}
      <div className="absolute bottom-4 inset-x-0 text-center text-[12px] text-white/55">
        {locked ? 'Session locked. ' : ''}{filled ? 'Guest credentials filled in. Press Log In or Enter.' : `Signing in as ${CONFIG.user}…`}
      </div>

      {busy && <div className="absolute inset-0 bg-black animate-[fadeIn_.5s_ease_forwards] z-20" />}
      {suspended && (
        <div className="absolute inset-0 bg-black z-30 flex items-end justify-center pb-6 cursor-pointer" onClick={() => setSuspended(false)}>
          <span className="text-[11px] text-white/25">Suspended. Press any key or click to wake up.</span>
        </div>
      )}
    </div>
  );
}

function BarBtn({ children, on, ...rest }) {
  return <button type="button" className={`h-full px-2.5 flex items-center ${on ? 'bg-white/15' : 'hover:bg-white/10'}`} {...rest}>{children}</button>;
}

function MenuItem({ children, onClick }) {
  return <button type="button" onClick={onClick} className="w-full text-left px-3 py-1.5 hover:bg-[#367bf0] hover:text-white">{children}</button>;
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
